import { ObjectId } from "mongodb";
import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import DKHPTDJob from "../entities/DKHPTDJob";
import DKHPTDJobLogs from "../entities/DKHPTDJobLogs";
import logger from "../loggers/logger";
import { toJson } from "../to";

export const setup = () => {
  jobBus.on(jobEvent.NEW_JOB_RESULT, async (result) => {
    try {
      logger.info(`Received job result ${toJson(result, 2)}`);
      const jobId = new ObjectId(result.id);
      const job = await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJob.name)
        .findOne({ _id: jobId });

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }

      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJob.name)
        .updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });

      const logs = new DKHPTDJobLogs({
        jobId,
        workerId: result.workerId,
        ownerAccountId: job.ownerAccountId,
        logs: result.logs,
        createdAt: Date.now(),
      });
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(DKHPTDJobLogs.name).insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });
};
