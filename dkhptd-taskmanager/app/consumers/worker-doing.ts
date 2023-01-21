import { workerEvent } from "../app-event";
import { workerBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { WorkerExchange } from "../exchange-name";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, WorkerExchange.WORKER_DOING, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const doing = JSON.parse(msg.content.toString());
        workerBus.emit(workerEvent.WORKER_DOING, doing);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
