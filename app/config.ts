import * as dotenv from "dotenv";

dotenv.config();

const config = {
  SECRET: process.env.SECRET || String(Math.round(Math.random() * Date.now())),
  JOB_ENCRYPTION_KEY: process.env.JOB_ENCRYPTION_KEY,
  BIND: process.env.BIND || "127.0.0.1",
  PORT: process.env.PORT || 8080,
  LOG_DIR: process.env.LOG_DIR || "./logs",

  RABBITMQ_CONNECTION_STRING: process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672",
  MONGODB_CONNECTION_STRING: process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017",
  DATABASE_NAME: "dkhptd",

  NEW_JOB_EVENT_NAME: "newJob",
  NEW_JOB_RESULT_EVENT_NAME: "newJobResult",
  DOING_EVENT_NAME: "doing",
  PING_EVENT_NAME: "ping",

  DKHPTD_WORKER_PING_EXCHANGE_NAME: "dkhptd.worker.ping",
  DKHPTD_WORKER_DOING_EXCHANGE_NAME: "dkhptd.worker.doing",

  DKHPTD_JOBS_QUEUE_NAME: "dkhptd.jobs",
  DKHPTD_JOB_RESULT_QUEUE_NAME: "dkhptd.jobs.result",
};

export default config;