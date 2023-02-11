import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { jobExchangeName } from "../exchange-name";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }
    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, jobExchangeName.MAYBE_STALE_JOB, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const jobId = msg.content.toString();
        jobBus.emit(jobEvent.STALE_JOB, jobId);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
