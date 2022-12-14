import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import QueueName from "../configs/QueueName";
import rabbitmqConnectionPool from "../connections/RabbitMQConnectionPool";
import logger from "../loggers/logger";
import { c } from "../utils/cypher";
import toBuffer from "../utils/toBuffer";
import toJson from "../utils/toJson";
import emitter from "./emiter";
import crypto from "crypto";

export default {
  setup() {
    emitter.on(AppEvent.NEW_JOB_V1, (job) => {
      logger.info("new Job V1: " + toJson(job));
      const iv = crypto.randomBytes(16).toString("hex");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });
  }
};
