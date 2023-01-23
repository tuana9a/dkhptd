import { ObjectId } from "mongodb";
import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import DKHPTDJob from "../entities/DKHPTDJob";
import logger from "../loggers/logger";
import loop from "../loop";
import ms from "ms";

export const setup = () => loop.infinity(async () => {
  try {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).find({
      timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
      status: JobStatus.READY,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJob(entry);
      jobBus.emit(jobEvent.NEW_JOB, job.toWorker());
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(DKHPTDJob.name).updateOne({ _id: new ObjectId(job._id) }, {
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
