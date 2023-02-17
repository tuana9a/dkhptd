import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";

export const setup = () => {
  jobV1Bus.on(jobV1Event.JOB_V1_UNKNOWN_ERROR, async (result, job: DKHPTDJobV1) => {
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.UNKOWN_ERROR } });
  });
};