import { ObjectId } from "mongodb";
import { jobV2Event } from "../app-event";
import { jobV2Bus } from "../bus";
import { rabbitmqConnectionPool } from "../connections";
import { jobV2ExchangeName } from "../exchange-name";
import { toBuffer } from "../to";

export const setup = () => {
  rabbitmqConnectionPool.getChannel().assertExchange(jobV2ExchangeName.MAYBE_STALE_JOB_V2, "fanout");
  jobV2Bus.on(jobV2Event.STALE_JOB_V2, (jobId: ObjectId) => {
    rabbitmqConnectionPool.getChannel().publish(jobV2ExchangeName.MAYBE_STALE_JOB_V2, "", toBuffer(jobId.toHexString()));
  });
};
