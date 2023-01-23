import { ObjectId } from "mongodb";
import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJob } from "../entities";
import logger from "../loggers/logger";

export const setup = () => {
  jobBus.on(jobEvent.STALE_JOB, async (jobId) => {
    try {
      jobId = new ObjectId(jobId);
      logger.info(`Received maybe stale job ${jobId}`);
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJob.name)
        .updateOne({ _id: jobId }, { $set: { status: JobStatus.TIMEOUT_OR_STALE } });
    } catch (err) {
      logger.error(err);
    }
  });
};
