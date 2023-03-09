import * as dotenv from "dotenv";

dotenv.config();

export const cfg = {
  SECRET: process.env.SECRET || String(Math.round(Math.random() * Date.now())),
  JOB_ENCRYPTION_KEY: process.env.JOB_ENCRYPTION_KEY,
  AMQP_ENCRYPTION_KEY: process.env.AMQP_ENCRYPTION_KEY,
  BIND: process.env.BIND || "127.0.0.1",
  PORT: process.env.PORT || 8080,
  LOG_DIR: process.env.LOG_DIR || "./logs",
  RABBITMQ_CONNECTION_STRING: process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672",
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017",
  DATABASE_NAME: "dkhptd",
};

export const JobStatus = {
  READY: 0,
  DOING: 1,
  CANCELED: 20,
  DONE: 21,
  FAILED: 22,
};

export const Role = {
  ADMIN: "ADMIN",
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
  PROCESS_PARSE_TKB_XLSX_RESULT: "process-parse-tkb-xlsx-result"
};

export const AppEvent = {
  TKB_XLSX_UPLOADED: "tkb-xlsx-uploaded",
  TKB_XLSX_PARSED: "tkb-xlsx-parsed",
  ADD_TERM_IDS: "add-term-ids",
  REPLACE_TERM_IDS: "replace-term-ids",
  UPSERT_MANY_SUBJECTS: "upsert-many-subjects",
  UPSERT_MANY_CTR: "upsert-many-class-to-registers",
};