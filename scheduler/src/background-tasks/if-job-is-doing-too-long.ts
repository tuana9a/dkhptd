import ms from "ms";
import { cfg, CollectionName, JobStatus, ExchangeName } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import { DKHPTDJob } from "../entities";
import logger from "../loggers/logger";
import { loop, toBuffer } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertExchange(ExchangeName.MAYBE_STALE_JOB, "fanout");
  loop.infinity(async () => {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).find({
      doingAt: { $lt: Date.now() - ms("1m") }, /* less than now - 1 minute then it's probaly dead or error */
      status: JobStatus.DOING,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJob(entry);
      const jobId = job._id;
      logger.info(`Found stale job ${jobId}`);
      rabbitmqConnectionPool.getChannel().publish(ExchangeName.MAYBE_STALE_JOB, "", toBuffer(jobId.toHexString()));
    }
  }, ms("10s"));
}
