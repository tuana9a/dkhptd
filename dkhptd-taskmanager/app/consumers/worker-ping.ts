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

    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, WorkerExchange.WORKER_PING, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const ping = JSON.parse(msg.content.toString());
        workerBus.emit(workerEvent.WORKER_PING, ping);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
