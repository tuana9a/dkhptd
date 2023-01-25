import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";
import { toJson } from "../utils";

export const setup = () => {
  jobV1Bus.on(jobV1Event.NEW_JOB_V1_RESULT, async (result) => {
    try {
      logger.info(`Received job v1 result: ${toJson(result, 2)}`);

      const jobId = new ObjectId(result.id);
      const job = new DKHPTDJobV1(await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .findOne({ _id: jobId }));

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }

      if (result.err) {
        logger.info(`Received job v1 result with error: ${toJson(result.err, 2)}`);
        jobV1Bus.emit(jobV1Event.JOB_V1_UNKNOWN_ERROR, result, job);
        return;
      }

      if (result.vars.systemError) {
        logger.info(`Received job v1 result with systemError: ${toJson(result.vars.systemError, 2)}`);
        jobV1Bus.emit(jobV1Event.JOB_V1_SYSTEM_ERROR, result, job);
        return;
      }

      jobV1Bus.emit(jobV1Event.JOB_V1_DONE, result, job);
    } catch (err) {
      logger.error(err);
    }
  });
};
