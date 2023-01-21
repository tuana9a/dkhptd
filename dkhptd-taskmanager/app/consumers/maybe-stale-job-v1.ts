import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { jobV1ExchangeName } from "../exchange-name";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }
    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, jobV1ExchangeName.MAYBE_STALE_JOB_V1, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const jobId = msg.content.toString();
        jobV1Bus.emit(jobV1Event.STALE_JOB_V1, jobId);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
