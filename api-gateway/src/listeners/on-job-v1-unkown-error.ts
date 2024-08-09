import { bus } from "../bus";
import { cfg, CollectionName, JobStatus, AppEvent } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";

export const setup = () => {
  bus.on(AppEvent.JOB_V1_UNKNOWN_ERROR, async (result, job: DKHPTDJobV1) => {
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1)
      .updateOne({ _id: job._id }, { $set: { status: JobStatus.UNKOWN_ERROR } });
  });
};