/* eslint-disable @typescript-eslint/no-var-requires */
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import { cfg } from "./cfg";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import logger from "./loggers/logger";
import { toJson } from "./utils";

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
      require("./auto-background-task").setup("./dist/background-tasks");
    });
  });
}

main();