import * as dotenv from "dotenv";
import { random } from "./utils";

dotenv.config();

export const cfg = {
  SECRET: process.env.SECRET || String(Math.round(Math.random() * Date.now())),
  JOB_ENCRYPTION_KEY: process.env.JOB_ENCRYPTION_KEY,
  AMQP_ENCRYPTION_KEY: process.env.AMQP_ENCRYPTION_KEY,
  BIND: process.env.BIND || "127.0.0.1",
  PORT: parseInt(process.env.PORT) || 8080,
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


export const Role = {
  ADMIN: "ADMIN",
  CLASS_REGISTER_FILE_UPLOADER: "CLASS_REGISTER_FILE_UPLOADER",
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
  SETTINGS: "settings",
  SUBJECT: "subject",
};

export const QueueName = {
  PARSE_TKB_XLSX: "parse-tkb-xslx",
  PROCESS_PARSE_TKB_XLSX_RESULT: "process-parse-tkb-xlsx-result",
  RUN_JOB: "run-job",
  PROCESS_JOB_RESULT: "process-job-result",
  RUN_JOB_V1: "run-job-v1",
  PROCESS_JOB_V1_RESULT: "process-job-v1-result",
  RUN_JOB_V2: "run-job-v2",
  PROCESS_JOB_V2_RESULT: "process-job-v2-result",
};

export const AppEvent = {
  TKB_XLSX_UPLOADED: "tkb-xlsx-uploaded",
  TKB_XLSX_PARSED: "tkb-xlsx-parsed",
  ADD_TERM_IDS: "add-term-ids",
  REPLACE_TERM_IDS: "replace-term-ids",
  UPSERT_MANY_SUBJECTS: "upsert-many-subjects",
  UPSERT_MANY_CTR: "upsert-many-class-to-registers",
  NEW_JOB: random.nextStr(),
  NEW_JOB_RESULT: random.nextStr(),
  STALE_JOB: random.nextStr(),
  NEW_JOB_V1: random.nextStr(),
  NEW_JOB_V1_RESULT: random.nextStr(), // deprecated
  JOB_V1_UNKNOWN_ERROR: random.nextStr(),
  JOB_V1_SYSTEM_ERROR: random.nextStr(),
  JOB_V1_CAPTCHA_ERROR: random.nextStr(),
  JOB_V1_DONE: random.nextStr(),
  NEW_JOB_V2: random.nextStr(),
  NEW_JOB_V2_RESULT: random.nextStr(),
  STALE_JOB_V2: random.nextStr(),
};

export const ExchangeName = {
  WORKER_PING: "worker-ping",
  WORKER_DOING: "worker-doing",
  MAYBE_STALE_JOB: "maybe-stale-job",
  MAYBE_STALE_JOB_V1: "maybe-stale-job-v1",
  MAYBE_STALE_JOB_V2: "maybe-stale-job-v2",
};
