import { ObjectId } from "mongodb";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJob from "../entities/DKHPTDJob";
import DKHPTDJobLogs from "../entities/DKHPTDJobLogs";
import logger from "../loggers/logger";
import emitter from "./emiter";

export default {
  setup() {
    emitter.on(AppEvent.NEW_JOB_RESULT, async (result) => {
      try {
        logger.info(`Received job result: ${result.id}`);
        const jobId = new ObjectId(result.id);
        const job = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).findOne({ _id: jobId });
  
        if (!job) {
          logger.warn(`Job ${result.id} not found for job result`);
          return;
        }
  
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
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
  }
};
