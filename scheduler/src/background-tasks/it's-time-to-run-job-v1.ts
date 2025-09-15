import crypto from "crypto";
import { rabbitmqConnectionPool } from "../connections";

import { ObjectId } from "mongodb";
import ms from "ms";
import { cfg, CollectionName, JobStatus, QueueName } from "../cfg";
import { mongoConnectionPool } from "../connections";
import { DKHPTDJobV1 } from "../entities";
import logger from "../loggers/logger";
import { decryptJobV1, toJobV1WorkerMessage, loop } from "../utils";
import { c } from "../cypher";
import { toJson, toBuffer } from "../utils";

export default () => loop.infinity(async () => {
  rabbitmqConnectionPool.getChannel().assertQueue(QueueName.RUN_JOB_V1, {});
  const cursor = mongoConnectionPool.getClient().db(cfg.DATABASE_NAME).collection(CollectionName.DKHPTDV1).find({
    timeToStart: { $lt: Date.now() }, /* less than now then it's time to run */
    status: JobStatus.READY,
  }, { sort: { timeToStart: 1 } });
  while (await cursor.hasNext()) {
    const entry = await cursor.next();
    const job = decryptJobV1(new DKHPTDJobV1(entry));
    logger.info("New job V1: " + job._id);
    const iv = crypto.randomBytes(16).toString("hex");
    rabbitmqConnectionPool.getChannel().sendToQueue(QueueName.RUN_JOB_V1, toBuffer(c(cfg.AMQP_ENCRYPTION_KEY).e(toJson(toJobV1WorkerMessage(job)), iv)), {
      headers: {
        iv: iv,
      }
    });
    await mongoConnectionPool.getClient()
      .db(cfg.DATABASE_NAME)
      .collection(CollectionName.DKHPTDV1)
      .updateOne({ _id: new ObjectId(job._id) }, {
        $set: {
          status: JobStatus.DOING,
          doingAt: Date.now(),
        },
      });
  }
}, ms("10s"));
