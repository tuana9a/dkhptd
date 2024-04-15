import * as dotenv from "dotenv";
import { nextStr } from "./next";

dotenv.config();

export const cfg = {
  SECRET: process.env.SECRET || String(Math.round(Math.random() * Date.now())),
  JOB_ENCRYPTION_KEY: process.env.JOB_ENCRYPTION_KEY,
  AMQP_ENCRYPTION_KEY: process.env.AMQP_ENCRYPTION_KEY,
  LOG_DIR: process.env.LOG_DIR || "./logs",
  RABBITMQ_CONNECTION_STRING: process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672",
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017",
  DATABASE_NAME: process.env.DATABASE_NAME || "dkhptd",
  JOB_MAX_TRY: 10,
  LOG_WORKER_DOING: parseInt(process.env.LOG_WORKER_DOING),
  LOG_WORKER_PING: parseInt(process.env.LOG_WORKER_PING),
};

export const JobStatus = {
  READY: 0,
  DOING: 1,
  CANCELED: 20,
  DONE: 21,
  FAILED: 22,
  TIMEOUT_OR_STALE: 23,
  UNKOWN_ERROR: 30,
  MAX_RETRY_REACH: 24,
};

export const CollectionName = {
  ACCOUNT: "account",
  CTR: "classToRegister",
  PREFERENCE: "preference",
  DKHPTD: "dkhptd",
  DKHPTDResult: "dkhptdResult",
  DKHPTDV1: "dkhptdV1",
  DKHPTDV1Result: "dkhptdV1Result",
  DKHPTDV2: "dkhptdV2",
  DKHPTDV2Result: "dkhptdV2Result",
};

export const QueueName = {
  RUN_JOB: "run-job",
  PROCESS_JOB_RESULT: "process-job-result",
  RUN_JOB_V1: "run-job-v1",
  PROCESS_JOB_V1_RESULT: "process-job-v1-result",
  RUN_JOB_V2: "run-job-v2",
  PROCESS_JOB_V2_RESULT: "process-job-v2-result",
};

export const ExchangeName = {
  WORKER_PING: "worker-ping",
  WORKER_DOING: "worker-doing",
  MAYBE_STALE_JOB: "maybe-stale-job",
  MAYBE_STALE_JOB_V1: "maybe-stale-job-v1",
  MAYBE_STALE_JOB_V2: "maybe-stale-job-v2",
};


export const AppEvent = {
  NEW_JOB: nextStr(),
  NEW_JOB_RESULT: nextStr(),
  STALE_JOB: nextStr(),
  NEW_JOB_V1: nextStr(),
  NEW_JOB_V1_RESULT: nextStr(), // deprecated
  JOB_V1_UNKNOWN_ERROR: nextStr(),
  JOB_V1_SYSTEM_ERROR: nextStr(),
  JOB_V1_CAPTCHA_ERROR: nextStr(),
  JOB_V1_DONE: nextStr(),
  NEW_JOB_V2: nextStr(),
  NEW_JOB_V2_RESULT: nextStr(),
  STALE_JOB_V2: nextStr(),
};