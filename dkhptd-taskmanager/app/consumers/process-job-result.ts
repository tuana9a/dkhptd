import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";
import { jobQueueName } from "../queue-name";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobQueueName.PROCESS_JOB_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(msg.content.toString());
        jobBus.emit(jobEvent.NEW_JOB_RESULT, result);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
