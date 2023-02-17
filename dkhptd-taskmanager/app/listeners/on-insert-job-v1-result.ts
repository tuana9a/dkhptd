import crypto from "crypto";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, CollectionName } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { c } from "../cypher";
import { DKHPTDJobV1, DKHPTDV1Result } from "../entities";
import { toJson } from "../utils";

export const setup = () => {
  jobV1Bus.on(jobV1Event.INSERT_JOB_V1_RESULT, async (result, job: DKHPTDJobV1) => {
    const newIv = crypto.randomBytes(16).toString("hex");
    const dkhptdResult = new DKHPTDV1Result({
      jobId: job._id,
      workerId: result.workerId,
      ownerAccountId: job.ownerAccountId,
      logs: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.logs), newIv),
      vars: c(cfg.JOB_ENCRYPTION_KEY).e(toJson(result.vars), newIv),
      createdAt: Date.now(),
      iv: newIv,
    });
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1Result)
      .insertOne(dkhptdResult);
  });
};
