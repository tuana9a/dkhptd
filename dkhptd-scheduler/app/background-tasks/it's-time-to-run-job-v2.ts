import { ObjectId } from "mongodb";
import ms from "ms";
import { jobV2Event } from "../app-event";
import { jobV2Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV2 } from "../entities";
import logger from "../loggers/logger";
import { decryptJobV2, jobV2ToMessage, loop } from "../utils";

export const setup = () => loop.infinity(async () => {
  try {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJobV2.name).find({
      timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
      status: JobStatus.READY,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = decryptJobV2(new DKHPTDJobV2(entry));
      jobV2Bus.emit(jobV2Event.NEW_JOB_V2, jobV2ToMessage(job));
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