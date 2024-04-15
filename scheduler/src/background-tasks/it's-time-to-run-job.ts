import { ObjectId } from "mongodb";
import { bus } from "../bus";
import { AppEvent, cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJob } from "../entities";
import logger from "../loggers/logger";
import ms from "ms";
import { loop, toJobWorkerMessage } from "../utils";

export const setup = () => loop.infinity(async () => {
  try {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).find({
      timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
      status: JobStatus.READY,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJob(entry);
      bus.emit(AppEvent.NEW_JOB, toJobWorkerMessage(job));
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).updateOne({ _id: new ObjectId(job._id) }, {
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
