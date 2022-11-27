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
    emitter.on(AppEvent.NEW_JOB_V2, (job) => {
      logger.info("new Job V2: " + toJson(job));
      const iv = crypto.randomBytes(16).toString("hex");
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.DKHPTD_JOBS_V2, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
        headers: {
          iv: iv,
        }
      });
    });
  }
};
