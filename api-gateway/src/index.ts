/* eslint-disable @typescript-eslint/no-var-requires */
import "module-alias/register";
import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import cors from "cors";

import { cfg, CollectionName, QueueName, Role } from "./cfg";
import logger from "./loggers/logger";
import { ensureIndex, toJson, toSHA256 } from "./utils";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import { cachedSettings } from "./services";
import { Account } from "./entities";

async function ensureRootAccount() {
  const doc = await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .findOne({ username: "root" });

  if (doc) return;
  const password = cfg.INIT_ROOT_PASSWORD;
  const account = new Account({ username: "root", password: toSHA256(password), role: Role.ADMIN });

  await mongoConnectionPool
    .getClient()
    .db(cfg.DATABASE_NAME)
    .collection(CollectionName.ACCOUNT)
    .insertOne(account);

  logger.info(`Insert root account with password ${password}`);
}

async function main() {
  logger.info(`Config: ${toJson(cfg)}`);

  const app = express();
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json());
  const server = http.createServer(app);
  server.listen(cfg.PORT, cfg.BIND);

  const client = await new MongoClient(cfg.MONGODB_CONNECTION_STRING).connect();
  mongoConnectionPool.addClient(client);
  cachedSettings.loadFromDb();
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.ACCOUNT, { username: 1, password: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.CTR, { classId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.CTR, { termId: 1 });
  ensureIndex(client.db(cfg.DATABASE_NAME), CollectionName.CTR, { classId: 1, termId: 1 });
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

  ensureRootAccount();

  amqplib.connect(cfg.RABBITMQ_CONNECTION_STRING, (error0, connection) => {
    if (error0) {
      logger.error(error0);
      return process.exit(0);
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        logger.error(error1);
        return process.exit(0);
      }
      rabbitmqConnectionPool.addChannel(channel);
      channel.assertQueue(QueueName.PARSE_TKB_XLSX);
      channel.assertQueue(QueueName.PROCESS_PARSE_TKB_XLSX_RESULT);
      app.use(require("./auto-route").setup("./dist/routes"));
      require("./auto-consumer").setup("./dist/consumers");
      require("./auto-listener").setup("./dist/listeners");
    });
  });
}

main();
