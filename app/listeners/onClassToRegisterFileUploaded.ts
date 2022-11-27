import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import logger from "../loggers/logger";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.CLASS_TO_REGISTER_FILE_UPLOADED, (buffer: Buffer) => {
      logger.info("new Parse XLSX Job");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.DKHPTD_PARSE_CTR_XLSX_JOBS, buffer);
    });
  }
};
