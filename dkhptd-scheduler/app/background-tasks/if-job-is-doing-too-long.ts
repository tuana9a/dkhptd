import ms from "ms";
import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJob } from "../entities";
import logger from "../loggers/logger";
import { loop } from "../utils";

export const setup = () => loop.infinity(async () => {
  try {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).find({
      doingAt: { $lt: Date.now() - ms("1m") }, /* less than now - 1 minute then it's probaly dead or error */
      status: JobStatus.DOING,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJob(entry);
      logger.info(`Found stale job ${job._id}`);
      jobBus.emit(jobEvent.STALE_JOB, job._id);
    }
  } catch (err) {
    logger.error(err);
  }
}, ms("10s"));
