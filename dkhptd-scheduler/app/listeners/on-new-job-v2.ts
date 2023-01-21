import crypto from "crypto";

import { jobV2Event } from "../app-event";
import { jobV2Bus } from "../bus";
import { cfg } from "../cfg";
import { rabbitmqConnectionPool } from "../connections";
import { c } from "../cypher";
import logger from "../loggers/logger";
import { jobV2QueueName } from "../queue-name";
import { toJson, toBuffer } from "../to";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobV2QueueName.RUN_JOB_V2, {});
  jobV2Bus.on(jobV2Event.NEW_JOB_V2, (job) => logger.info("new Job V2: " + toJson(job)));
  jobV2Bus.on(jobV2Event.NEW_JOB_V2, (job) => {
    const iv = crypto.randomBytes(16).toString("hex");
    rabbitmqConnectionPool.getChannel().sendToQueue(jobV2QueueName.RUN_JOB_V2, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(job), iv)), {
      headers: {
        iv: iv,
      }
    });
  });
};
