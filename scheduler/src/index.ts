/* eslint-disable @typescript-eslint/no-var-requires */
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import { cfg } from "./cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import logger from "./loggers/logger";
import { toJson } from "./utils";
import ifJobIsDoingTooLong from "./background-tasks/if-job-is-doing-too-long";
import ifJobV1IsDoingTooLong from "./background-tasks/if-job-v1-is-doing-too-long";
import itSTimeToRunJob from "./background-tasks/it's-time-to-run-job";
import itSTimeToRunJobV1 from "./background-tasks/it's-time-to-run-job-v1";
import itSTimeToRunJobV2 from "./background-tasks/it's-time-to-run-job-v2";

async function main() {
  logger.info(`Config: ${toJson(cfg)}`);

  const client = await new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect();
  mongoConnectionPool.addClient(client);

  amqplib.connect(cfg.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
    if (error0) {
      logger.error(error0);
      return process.exit(0);
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        logger.error(error1);
        return;
      }
      rabbitmqConnectionPool.addChannel(channel);
      ifJobIsDoingTooLong();
      ifJobV1IsDoingTooLong();
      itSTimeToRunJob();
      itSTimeToRunJobV1();
      itSTimeToRunJobV2();
    });
  });
}

main();