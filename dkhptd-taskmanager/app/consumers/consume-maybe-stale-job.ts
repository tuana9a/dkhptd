import { bus } from "../bus";
import { ExchangeName, AppEvent } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }
    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.MAYBE_STALE_JOB, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const jobId = msg.content.toString();
        bus.emit(AppEvent.STALE_JOB, jobId);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
