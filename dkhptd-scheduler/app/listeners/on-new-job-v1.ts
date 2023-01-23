import crypto from "crypto";

import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import logger from "../loggers/logger";
import { jobV1QueueName } from "../queue-name";
import { toJson, toBuffer } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobV1QueueName.RUN_JOB_V1, {});
  jobV1Bus.on(jobV1Event.NEW_JOB_V1, (job) => logger.info("new Job V1: " + toJson(job)));
  jobV1Bus.on(jobV1Event.NEW_JOB_V1, (job) => {
    const iv = crypto.randomBytes(16).toString("hex");
    rabbitmqConnectionPool.getChannel().sendToQueue(jobV1QueueName.RUN_JOB_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
      headers: {
        iv: iv,
      }
    });
  });
};
