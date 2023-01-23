/* eslint-disable @typescript-eslint/no-var-requires */
import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import cors from "cors";

import { cfg } from "./cfg";
import logger from "./loggers/logger";
import { toKeyValueString } from "./utils";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import { tkbQueueName } from "./queue-name";
import { getPrettyLoadedRoutes } from "./utils";

async function main() {
  logger.info(`Config: \n${toKeyValueString(cfg)}`);

  const app = express();
  app.use(cors());
  app.use(express.json());
  const server = http.createServer(app);
  server.listen(cfg.PORT);

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
      channel.assertQueue(tkbQueueName.PARSE_TKB_XLSX);
      channel.assertQueue(tkbQueueName.PROCESS_PARSE_TKB_XLSX_RESULT);
      const routeInfo = {};
      app.use(require("./auto-route").setup("./dist/routes", "", routeInfo));
      logger.info(`Loaded routes:\n${getPrettyLoadedRoutes(routeInfo).map(x => `${x.path} -> ${x.m}`).join("\n")}`);
      require("./auto-consumer").setup("./dist/consumers");
      require("./auto-listener").setup("./dist/listeners");
    });
  });
}

main();
