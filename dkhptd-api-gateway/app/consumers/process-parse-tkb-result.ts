import { tkbEvent } from "../app-event";
import { tkbBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";
import { tkbQueueName } from "../queue-name";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(tkbQueueName.PROCESS_PARSE_TKB_XLSX_RESULT, {}, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }

    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const result = JSON.parse(msg.content.toString());
        tkbBus.emit(tkbEvent.TKB_XLSX_PARSED, result);
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
