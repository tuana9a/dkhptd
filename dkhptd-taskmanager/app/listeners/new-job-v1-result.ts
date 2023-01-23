import crypto from "crypto";
import { ObjectId } from "mongodb";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { c } from "../cypher";
import { DKHPTDJobV1, DKHPTDV1Result } from "../entities";
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
        const jobId = new ObjectId(result.id);
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(DKHPTDJobV1.name)
          .updateOne({ _id: jobId }, { $set: { status: JobStatus.UNKOWN_ERROR } });
        return;
      }

      if (result.vars.systemError) {
        logger.info(`Received job v1 result with systemError: ${toJson(result.vars.systemError, 2)}`);
        const jobId = new ObjectId(result.id);
        if (job.no > cfg.JOB_MAX_TRY) { // max tries reach
          logger.info(`Max retry reach for job v1 ${jobId}`);
          await mongoConnectionPool.getClient()
            .db(cfg.DATABASE_NAME)
            .collection(DKHPTDJobV1.name)
            .updateOne({ _id: jobId }, { $set: { status: JobStatus.MAX_RETRY_REACH } });
          return;
        }
        logger.info(`Retry job v1 ${jobId} because of systemError`);
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(DKHPTDJobV1.name)
          .updateOne({ _id: jobId }, { $set: { status: JobStatus.READY } }); // set READY for scheduler retry it
        return;
      }

      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME)
        .collection(DKHPTDJobV1.name)
        .updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });

      const newIv = crypto.randomBytes(16).toString("hex");
      const logs = new DKHPTDV1Result({
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
        .collection(DKHPTDV1Result.name)
        .insertOne(logs);
    } catch (err) {
      logger.error(err);
    }
  });
};
