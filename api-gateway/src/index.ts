/* eslint-disable @typescript-eslint/no-var-requires */
import "module-alias/register";
import http from "http";
import express from "express";
import * as amqplib from "amqplib/callback_api";
import { MongoClient } from "mongodb";
import cors from "cors";

import { cfg, CollectionName, QueueName } from "./cfg";
import logger from "./loggers/logger";
import { ensureIndex, toJson } from "./utils";
import { mongoConnectionPool, rabbitmqConnectionPool } from "./connections";
import { cachedSettings } from "./services";

import dkhptdRouter from "./routes/dkhptd";
import dkhptdRouterV1 from "./routes/dkhptd-v1";
import dkhptdRouterV2 from "./routes/dkhptd-v2";
import preferenceRouter from "./routes/preference";
import accountRouter from "./routes/account";
import roleRouter from "./routes/role";
import classToRegistersRouter from "./routes/class-to-register";
import loginRouter from "./routes/login";
import settingRouter from "./routes/setting";
import signupRouter from "./routes/signup";
import subjectRouter from "./routes/subject";
import termIdRouter from "./routes/term-id";
import consumeJobResult from "./consumers/consume-job-result";
import consumeJobV1Result from "./consumers/consume-job-v1-result";
import consumeMaybeStaleJob from "./consumers/consume-maybe-stale-job";
import consumeMaybeStaleJobV1 from "./consumers/consume-maybe-stale-job-v1";
import consumeWorkerDoing from "./consumers/consume-worker-doing";
import consumeWorkerPing from "./consumers/consume-worker-ping";
import consumeParseTkbResult from "./consumers/process-parse-tkb-result";
import addTermIdsListener from "./listeners/add-term-ids";
import onJobV1CaptchaErrorListener from "./listeners/on-job-v1-captcha-error";
import onJobV1DoneListener from "./listeners/on-job-v1-done";
import onJobV1SystemErrorListener from "./listeners/on-job-v1-system-error";
import onJobV1UnkownErrorListener from "./listeners/on-job-v1-unkown-error";
import replaceTermIdsListener from "./listeners/replace-term-ids";
import upsertManyClassToRegistersListener from "./listeners/upsert-many-class-to-registers";
import upsertManySubjectsListener from "./listeners/upsert-many-subjects";

async function main() {
  logger.info(`Config: ${toJson(cfg)}`);

  const app = express();
  app.set("trust proxy", true);
  app.use(cors());
  app.use(express.json());
  app.use(preferenceRouter);
  app.use(dkhptdRouter);
  app.use(dkhptdRouterV1);
  app.use(dkhptdRouterV2);
  app.use(accountRouter);
  app.use(roleRouter);
  app.use(classToRegistersRouter);
  app.use(loginRouter);
  app.use(settingRouter);
  app.use(signupRouter);
  app.use(subjectRouter);
  app.use(termIdRouter);
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
      consumeJobResult();
      consumeJobV1Result();
      consumeMaybeStaleJob();
      consumeMaybeStaleJobV1();
      consumeWorkerDoing();
      consumeWorkerPing();
      consumeParseTkbResult();

      addTermIdsListener();
      onJobV1DoneListener();
      onJobV1CaptchaErrorListener();
      onJobV1SystemErrorListener();
      onJobV1UnkownErrorListener();
      replaceTermIdsListener();
      upsertManyClassToRegistersListener();
      upsertManySubjectsListener();
    });
  });
}

main();
