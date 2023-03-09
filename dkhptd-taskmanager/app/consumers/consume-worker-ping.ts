import { ExchangeName, cfg } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";
import { toJson } from "../utils";

export const setup = () => {
  if (cfg.LOG_WORKER_PING) {
    rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
      if (error2) {
        logger.error(error2);
        return;
      }

      rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.WORKER_PING, "");
      rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
        try {
          const ping = JSON.parse(msg.content.toString());
          logger.info(`Ping: ${toJson(ping)}`);
        } catch (err) {
          logger.error(err);
        }
        rabbitmqConnectionPool.getChannel().ack(msg);
      }, { noAck: false });
    });
  }
};
