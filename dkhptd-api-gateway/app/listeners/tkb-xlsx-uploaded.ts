import { tkbEvent } from "../app-event";
import { tkbBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";
import { toBuffer } from "../utils";
import { tkbQueueName } from "../queue-name";

export const setup = () => {
  tkbBus.on(tkbEvent.TKB_XLSX_UPLOADED, async (file: Buffer) => {
    try {
      logger.info(`Received uploaded TKB xlsx length ${file.length}`);

      rabbitmqConnectionPool.getChannel().sendToQueue(tkbQueueName.PARSE_TKB_XLSX, toBuffer(file));
    } catch (err) {
      logger.error(err);
    }
  });
};
