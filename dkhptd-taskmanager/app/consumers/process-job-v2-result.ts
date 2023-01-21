import { jobV2Event } from "../app-event";
import { jobV2Bus } from "../bus";
import { cfg } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import logger from "../loggers/logger";
import { jobV2QueueName } from "../queue-name";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobV2QueueName.PROCESS_JOB_V2_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
        jobV2Bus.emit(jobV2Event.NEW_JOB_V2_RESULT, result);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
