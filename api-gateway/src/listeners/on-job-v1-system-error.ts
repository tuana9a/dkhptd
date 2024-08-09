import { bus } from "../bus";
import { cfg, CollectionName, JobStatus, AppEvent } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";
import ms from "ms";

export const setup = () => {
  bus.on(AppEvent.JOB_V1_SYSTEM_ERROR, async (result, job: DKHPTDJobV1) => {
    if (job.no > cfg.JOB_MAX_TRY) { // max tries reach
      logger.info(`Max retry reach for job v1 ${job._id}`);
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(CollectionName.DKHPTDV1)
        .updateOne({ _id: job._id }, { $set: { status: JobStatus.MAX_RETRY_REACH } });
      return;
    }
    logger.info(`Retry job v1 ${job._id} because of systemError`);
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.READY, timeToStart: Date.now() + ms("1m") } }); // set READY and delay 1p for scheduler retry it
  });
};