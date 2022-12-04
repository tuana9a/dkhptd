import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import logger from "../loggers/logger";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.TKB_XLSX_UPLOADED, (buffer: Buffer) => {
      logger.info("new Parse XLSX Job");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.PARSE_TKB_XLSX, buffer);
    });
  }
};
