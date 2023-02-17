import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, CollectionName } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";
import { jobV1QueueName } from "../queue-name";
import { toJson } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobV1QueueName.PROCESS_JOB_V1_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));

        const doc = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(CollectionName.DKHPTDV1)
          .findOne({ _id: new ObjectId(result.id) });
        const job = new DKHPTDJobV1(doc);

        if (!job) {
          logger.warn(`Received job v1 ${result.id} but job can't be found`);
          return;
        }

        jobV1Bus.emit(jobV1Event.INSERT_JOB_V1_RESULT, result, job);

        if (result.err) {
          logger.info(`Received job v1 ${result.id} result with error ${toJson(result.err, 2)}`);
          jobV1Bus.emit(jobV1Event.JOB_V1_UNKNOWN_ERROR, result, job);
          return;
        }

        if (result.vars.systemError) {
          logger.info(`Received job v1 ${result.id} result with systemError ${toJson(result.vars.systemError, 2)}`);
          jobV1Bus.emit(jobV1Event.JOB_V1_SYSTEM_ERROR, result, job);
          return;
        }

        // user error + captcha error + no error
        logger.info(`Received job v1 ${result.id} result done`);
        jobV1Bus.emit(jobV1Event.JOB_V1_DONE, result, job);
      } catch (err) {
        logger.error(err);
      }
    }, { noAck: true });
  });
};
