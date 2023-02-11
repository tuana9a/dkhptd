import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { jobV1ExchangeName } from "../exchange-name";
import logger from "../loggers/logger";
import { toBuffer } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertExchange(jobV1ExchangeName.MAYBE_STALE_JOB_V1, "fanout");
  jobV1Bus.on(jobV1Event.STALE_JOB_V1, (jobId: ObjectId) => {
    logger.info(`Send stale job v1 ${jobId}`);
    rabbitmqConnectionPool.getChannel().publish(jobV1ExchangeName.MAYBE_STALE_JOB_V1, "", toBuffer(jobId.toHexString()));
  });
};
