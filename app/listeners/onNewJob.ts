import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import logger from "../loggers/logger";
import toBuffer from "../utils/toBuffer";
import toJson from "../utils/toJson";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.NEW_JOB, (job) => {
      logger.info("new Job: " + toJson(job));
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.DKHPTD_JOBS, toBuffer(toJson(job)));
    });
  }
};
