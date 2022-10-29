const dotenv = require("dotenv");

dotenv.config();

const SECRET = process.env.SECRET || String(Math.random() * Date.now());
const BIND = process.env.BIND || "127.0.0.1";
const PORT = process.env.PORT || 8080;
const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672";
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
const NEW_JOB = "jobs.new";
const WORKER_FEEDBACK = "worker.feedback";
const JOB_RESULT = "jobs.result";
const JOB_RESULT_COLLECTION_NAME = "jobResult";
const DKHPTD_JOB_COLLECTION_NAME = "dkhptdJob";
const DOING = "doing";
const PING = "ping";
const APP_ID = `dkhptd${Date.now()}`;

module.exports = {
  SECRET,
  BIND,
  PORT,
  RABBITMQ_CONNECTION_STRING,
  MONGODB_CONNECTION_STRING,
  NEW_JOB,
  WORKER_FEEDBACK,
  JOB_RESULT,
  JOB_RESULT_COLLECTION_NAME,
  DKHPTD_JOB_COLLECTION_NAME,
  DOING,
  PING,
  APP_ID,
};
