import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";
import { jobQueueName } from "../queue-name";
import { toJson, toBuffer } from "../to";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(jobQueueName.RUN_JOB, {});
  jobBus.on(jobEvent.NEW_JOB, (job) => logger.info("new Job: " + toJson(job)));
  jobBus.on(jobEvent.NEW_JOB, (job) => rabbitmqConnectionPool.getChannel().sendToQueue(jobQueueName.RUN_JOB, toBuffer(toJson(job))));
};