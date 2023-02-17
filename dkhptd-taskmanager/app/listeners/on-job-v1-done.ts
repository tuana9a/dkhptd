import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";

export const setup = () => {
  // user error + captcha error + no error
  jobV1Bus.on(jobV1Event.JOB_V1_DONE, async (result, job: DKHPTDJobV1) => {
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.DONE } });
  });
};