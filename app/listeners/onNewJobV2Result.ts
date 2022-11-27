import { ObjectId } from "mongodb";
import cfg from "../cfg";
import AppEvent from "../configs/AppEvent";
import JobStatus from "../configs/JobStatus";
import mongoConnectionPool from "../connections/MongoConnectionPool";
import DKHPTDJobV2 from "../entities/DKHPTDJobV2";
import DKHPTDJobV2Logs from "../entities/DKHPTDJobV2Logs";
import logger from "../loggers/logger";
import { c } from "../utils/cypher";
import toJson from "../utils/toJson";
import emitter from "./emiter";
import crypto from "crypto";

export default {
  setup() {
    emitter.on(AppEvent.NEW_JOB_V2_RESULT, async (result) => {
      try {
        logger.info(`Received job v2 result: ${result.id}`);
        const jobId = new ObjectId(result.id);
        const job = await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).findOne({ _id: jobId });

        if (!job) {
          logger.warn(`Job ${result.id} not found for job result`);
          return;
        }
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).updateOne({ _id: jobId }, { $set: { status: JobStatus.DONE } });
        const newIv = crypto.randomBytes(16).toString("hex");
        const logs = new DKHPTDJobV2Logs({
          jobId,
          workerId: result.workerId,
          ownerAccountId: job.ownerAccountId,
          logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
          createdAt: Date.now(),
          iv: newIv,
        });
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2Logs.name).insertOne(logs);
      } catch (err) {
        logger.error(err);
      }
    });
  }
};
