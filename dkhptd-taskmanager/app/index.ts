/* eslint-disable @typescript-eslint/no-var-requires */
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import { cfg } from "./cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import { jobExchangeName, jobV1ExchangeName, jobV2ExchangeName } from "./exchange-name";
import logger from "./loggers/logger";
import { toJson, toKeyValueString } from "./to";

async function main() {
  logger.info(`Config: \n${toKeyValueString(cfg)}`);

  const client = await new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect();
  mongoConnectionPool.addClient(client);

  amqplib.connect(cfg.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
    if (error0) {
      logger.error(error0);
      return;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        logger.error(error1);
        return;
      }
      rabbitmqConnectionPool.addChannel(channel);

      channel.assertExchange(jobExchangeName.MAYBE_STALE_JOB, "fanout");
      channel.assertExchange(jobV1ExchangeName.MAYBE_STALE_JOB_V1, "fanout");
      channel.assertExchange(jobV2ExchangeName.MAYBE_STALE_JOB_V2, "fanout");

      const loadedConsumers = require("./auto-consumer").setup("./dist/consumers");
      logger.info(`Loaded consumers: ${toJson(loadedConsumers, 2)}`);
      const loadedListeners = require("./auto-listener").setup("./dist/listeners");
      logger.info(`Loaded listeners: ${toJson(loadedListeners, 2)}`);
    });
  });
}

main();
