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
