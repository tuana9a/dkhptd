import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";

export const setup = () => {
  jobV1Bus.on(jobV1Event.STALE_JOB_V1, async (jobId) => {
    try {
      jobId = new ObjectId(jobId);
      logger.info(`Received maybe stale job v1 ${jobId}`);
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .updateOne({ _id: jobId }, { $set: { status: JobStatus.TIMEOUT_OR_STALE } });
    } catch (err) {
      logger.error(err);
    }
  });
};
