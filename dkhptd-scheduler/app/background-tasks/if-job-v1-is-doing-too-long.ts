import ms from "ms";
import { jobV1Event } from "../app-event";
import { jobV1Bus } from "../bus";
import { cfg, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import DKHPTDJobV1 from "../entities/DKHPTDJobV1";
import logger from "../loggers/logger";
import loop from "../loop";

export const setup = () => loop.infinity(async () => {
  try {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(DKHPTDJobV1.name).find({
      doingAt: { $lt: Date.now() - ms("1m") }, /* less than now - 1 minute then it's probaly dead or error */
      status: JobStatus.DOING,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJobV1(entry).decrypt();
      logger.info(`Found stale job v1 ${job._id}`);
      jobV1Bus.emit(jobV1Event.STALE_JOB_V1, job._id);
    }
  } catch (err) {
    logger.error(err);
  }
}, ms("10s"));
