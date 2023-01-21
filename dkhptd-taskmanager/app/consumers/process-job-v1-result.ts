import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import logger from "../loggers/logger";
import { jobV1QueueName } from "../queue-name";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobV1QueueName.PROCESS_JOB_V1_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(c(cfg.AMQP_ENCRYPTION_KEY).d(msg.content.toString(), msg.properties.headers.iv));
        jobV1Bus.emit(jobV1Event.NEW_JOB_V1_RESULT, result);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
