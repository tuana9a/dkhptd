import { ObjectId } from "mongodb";
import { jobEvent } from "../app-event";
import { jobBus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { jobExchangeName } from "../exchange-name";
import { toBuffer } from "../to";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertExchange(jobExchangeName.MAYBE_STALE_JOB, "fanout");
  jobBus.on(jobEvent.STALE_JOB, (jobId: ObjectId) => {
    rabbitmqConnectionPool.getChannel().publish(jobExchangeName.MAYBE_STALE_JOB, "", toBuffer(jobId.toHexString()));
  });
};
