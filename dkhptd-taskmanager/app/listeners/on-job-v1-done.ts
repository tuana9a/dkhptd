import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";

export const setup = () => {
  // user error + captcha error + no error
  jobV1Bus.on(jobV1Event.JOB_V1_UNKNOWN_ERROR, async (result, job: DKHPTDJobV1) => {
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(DKHPTDJobV1.name)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.DONE } });
  });
};