import crypto from "crypto";

import { bus } from "../bus";
import { cfg, QueueName, AppEvent } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import logger from "../loggers/logger";
import { toJson, toBuffer } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.RUN_JOB_V1, {});
  bus.on(AppEvent.NEW_JOB_V1, (job) => logger.info("New job V1: " + job.id));
  bus.on(AppEvent.NEW_JOB_V1, (job) => {
    const iv = crypto.randomBytes(16).toString("hex");
    rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
      headers: {
        iv: iv,
      }
    });
  });
};
