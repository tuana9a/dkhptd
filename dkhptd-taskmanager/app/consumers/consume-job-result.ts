import { bus } from "../bus";
import { QueueName, AppEvent } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.PROCESS_JOB_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(msg.content.toString());
        bus.emit(AppEvent.NEW_JOB_RESULT, result);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
