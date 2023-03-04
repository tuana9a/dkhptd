/* eslint-disable @typescript-eslint/no-var-requires */
import "module-alias/register";
import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import cors from "cors";

import { cfg, CollectionName } from "./cfg";
import logger from "./loggers/logger";
import { ensureIndex, toKeyValueString } from "./utils";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import { tkbQueueName } from "./queue-name";
import { cachedSettings } from "./services";

async function main() {
  logger.info(`Config: \n${toKeyValueString(cfg)}`);

  const app = express();
  app.use(cors());
  app.use(express.json());
  const server = http.createServer(app);
  server.listen(cfg.PORT);

  const client = await new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect();
  mongoConnectionPool.addClient(client);
  cachedSettings.loadFromDb();
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.ACCOUNT, { username: 1, password: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.CTR, { classId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.CTR, { classId: 1, learnDayNumber: 1, termId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1, { ownerAccountId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1, { ownerAccountId: 1, termId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1, { timeToStart: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1Result, { jobId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1Result, { ownerAccountId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.DKHPTDV1Result, { ownerAccountId: 1, jobId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.PREFERENCE, { ownerAccountId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.PREFERENCE, { ownerAccountId: 1, termId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.SUBJECT, { subjectId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.SUBJECT, { subjectName: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.SUBJECT, { subjectId: 1, subjectName: 1 });

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
      app.use(require("./auto-route").setup("./dist/routes"));
      require("./auto-consumer").setup("./dist/consumers");
      require("./auto-listener").setup("./dist/listeners");
    });
  });
}

main();
