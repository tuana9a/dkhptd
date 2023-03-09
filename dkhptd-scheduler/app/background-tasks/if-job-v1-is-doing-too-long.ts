import ms from "ms";
import { cfg, CollectionName, JobStatus, ExchangeName } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";
import { decryptJobV1, loop, toBuffer } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertExchange(ExchangeName.MAYBE_STALE_JOB_V1, "fanout");
  loop.infinity(async () => {
    try {
      const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTDV1).find({
        doingAt: { $lt: Date.now() - ms("1m") }, /* less than now - 1 minute then it's probaly dead or error */
        status: JobStatus.DOING,
      }, { sort: { timeToStart: 1 } });
      while (await cursor.hasNext()) {
        const entry = await cursor.next();
        const job = decryptJobV1(new DKHPTDJobV1(entry));
        const jobId = job._id;
        logger.info(`Send stale job v1 ${jobId}`);
        rabbitmqConnectionPool.getChannel().publish(ExchangeName.MAYBE_STALE_JOB_V1, "", toBuffer(jobId.toHexString()));
      }
    } catch (err) {
      logger.error(err);
    }
  }, ms("10s"));
};