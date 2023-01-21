import { ObjectId } from "mongodb";
import ms from "ms";
import { jobV2Event } from "../app-event";
import { jobV2Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import DKHPTDJobV2 from "../entities/DKHPTDJobV2";
import logger from "../loggers/logger";
import loop from "../loop";

export const setup = () => loop.infinity(async () => {
  try {
    logger.info("check run job v2");
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).find({
      timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
      status: JobStatus.READY,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJobV2(entry).decrypt();
      jobV2Bus.emit(jobV2Event.NEW_JOB_V2, job.toWorker());
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).updateOne({ _id: new ObjectId(job._id) }, {
          $set: {
            status: JobStatus.DOING,
            doingAt: Date.now(),
          },
        });
    }
  } catch (err) {
    logger.error(err);
  }
}, ms("10s"));