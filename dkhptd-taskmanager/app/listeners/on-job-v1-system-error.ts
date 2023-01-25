import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";

export const setup = () => {
  jobV1Bus.on(jobV1Event.JOB_V1_SYSTEM_ERROR, async (result, job: DKHPTDJobV1) => {
    if (job.no > cfg.JOB_MAX_TRY) { // max tries reach
      logger.info(`Max retry reach for job v1 ${job._id}`);
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .updateOne({ _id: job._id }, { $set: { status: JobStatus.MAX_RETRY_REACH } });
      return;
    }
    logger.info(`Retry job v1 ${job._id} because of systemError`);
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(DKHPTDJobV1.name)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.READY } }); // set READY for scheduler retry it
  });
};