import { ObjectId } from "mongodb";
import { bus } from "../bus";
import { cfg, CollectionName, QueueName, AppEvent } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import { DKHPTDJobV1, DKHPTDJobV1Result } from "../entities";
import logger from "../loggers/logger";
import { toJson } from "../utils";
import crypto from "crypto";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_V1_RESULT, {}, (error2, q) => {
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

        const newIv = crypto.randomBytes(16).toString("hex");
        const dkhptdResult = new DKHPTDJobV1Result({
          jobId: job._id,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
          vars: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.vars), newIv),
          createdAt: Date.now(),
          iv: newIv,
        });

        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(CollectionName.DKHPTDV1Result)
          .insertOne(dkhptdResult);

        if (result.err) {
          logger.info(`Received job v1 ${result.id} result with error ${toJson(result.err, 2)}`);
          bus.emit(AppEvent.JOB_V1_UNKNOWN_ERROR, result, job);
          return;
        }

        if (result.vars.systemError) {
          logger.info(`Received job v1 ${result.id} result with systemError ${toJson(result.vars.systemError, 2)}`);
          bus.emit(AppEvent.JOB_V1_SYSTEM_ERROR, result, job);
          return;
        }

        if (String(result.vars.userError).match(/captcha/i)) {
          logger.info(`Received job v1 ${result.id} result with captchaError ${toJson(result.vars.userError, 2)}`);
          bus.emit(AppEvent.JOB_V1_CAPTCHA_ERROR, result, job);
          return;
        }

        // user error + no error
        logger.info(`Received job v1 ${result.id} result done`);
        bus.emit(AppEvent.JOB_V1_DONE, result, job);
      } catch (err) {
        logger.error(err);
      }
    }, { noAck: true });
  });
};
