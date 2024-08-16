import { ObjectId } from "mongodb";
import ms from "ms";
import { cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV2 } from "../entities";
import logger from "../loggers/logger";
import { decryptJobV2, toJobV2WorkerMessage, loop } from "../utils";

export const setup = () => loop.infinity(async () => {
  const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTDV2).find({
    timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
    status: JobStatus.READY,
  }, { sort: { timeToStart: 1 } });
  while (await cursor.hasNext()) {
    const entry = await cursor.next();
    const job = decryptJobV2(new DKHPTDJobV2(entry));
    logger.info("New job V2: " + job._id)
    // TODO: send to execute
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTDV2).updateOne({ _id: new ObjectId(job._id) }, {
        $set: {
          status: JobStatus.DOING,
          doingAt: Date.now(),
        },
      });
  }
}, ms("10s"));