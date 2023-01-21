import crypto from "crypto";
import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { c } from "../cypher";
import DKHPTDJobV1 from "../entities/DKHPTDJobV1";
import DKHPTDJobV1Logs from "../entities/DKHPTDJobV1Logs";
import logger from "../loggers/logger";
import { toJson } from "../to";

export const setup = () => {
  jobV1Bus.on(jobV1Event.NEW_JOB_V1_RESULT, async (result) => {
    try {
      if (result.err) {
        logger.info(`Received job v1 result with error: ${toJson(result.err, 2)}`);
        return;
      }

      logger.info(`Received job v1 result: ${toJson(result, 2)}`);

      const jobId = new ObjectId(result.id);
      const job = await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .findOne({ _id: jobId });

      if (!job) {
        logger.warn(`Job ${result.id} not found for job result`);
        return;
      }

      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });

      const newIv = crypto.randomBytes(16).toString("hex");
      const logs = new DKHPTDJobV1Logs({
        jobId,
        workerId: result.workerId,
        ownerAccountId: job.ownerAccountId,
        logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
        vars: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.vars), newIv),
        createdAt: Date.now(),
        iv: newIv,
      });

      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1Logs.name)
        .insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });
};
