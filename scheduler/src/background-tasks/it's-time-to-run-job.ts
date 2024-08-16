import { ObjectId } from "mongodb";
import { cfg, CollectionName, JobStatus, QueueName } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import { DKHPTDJob } from "../entities";
import logger from "../loggers/logger";
import ms from "ms";
import { loop, toBuffer, toJobWorkerMessage } from "../utils";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.RUN_JOB, {});
  loop.infinity(async () => {
    const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).find({
      timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
      status: JobStatus.READY,
    }, { sort: { timeToStart: 1 } });
    while (await cursor.hasNext()) {
      const entry = await cursor.next();
      const job = new DKHPTDJob(entry);
      logger.info("New job: " + job._id)
      rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB, toBuffer(toJobWorkerMessage(job)));
      await mongoConnectionPool.getClient()
        .db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTD).updateOne({ _id: new ObjectId(job._id) }, {
          $set: {
            status: JobStatus.DOING,
            doingAt: Date.now(),
          },
        });
    }
  }, ms("10s"));
}
