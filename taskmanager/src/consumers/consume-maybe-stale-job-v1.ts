import { ObjectId } from "mongodb";
import { ExchangeName, cfg, CollectionName, JobStatus } from "../cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "../connections";
import logger from "../loggers/logger";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertQueue("", { autoDelete: true }, (error2, q) => {
    if (error2) {
      logger.error(error2);
      return;
    }
    rabbitmqConnectionPool.getChannel().bindQueue(q.queue, ExchangeName.MAYBE_STALE_JOB_V1, "");
    rabbitmqConnectionPool.getChannel().consume(q.queue, async (msg) => {
      try {
        const jobId = new ObjectId(msg.content.toString());
        logger.info(`Received maybe stale job v1 ${jobId}`);
        await mongoConnectionPool.getClient()
          .db(cfg.DATABASE_NAME)
          .collection(CollectionName.DKHPTDV1)
          .updateOne({ _id: jobId }, { $set: { status: JobStatus.TIMEOUT_OR_STALE } });
      } catch (err) {
        logger.error(err);
      }
      rabbitmqConnectionPool.getChannel().ack(msg);
    }, { noAck: false });
  });
};
