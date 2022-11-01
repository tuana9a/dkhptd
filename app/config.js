const dotenv = require("dotenv");

dotenv.config();

module.exports.SECRET = process.env.SECRET || String(Math.round(Math.random() * Date.now()));
module.exports.BIND = process.env.BIND || "127.0.0.1";
module.exports.PORT = process.env.PORT || 8080;
module.exports.LOG_DIR = process.env.LOG_DIR || "./logs";
module.exports.RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672";
module.exports.MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
module.exports.DATABASE_NAME = "dkhptd";
module.exports.NEW_JOB = "jobs.new";
module.exports.WORKER_FEEDBACK = "worker.feedback";
module.exports.JOB_RESULT = "jobs.result";
module.exports.JOB_RESULT_COLLECTION_NAME = "jobResult";
module.exports.DKHPTD_JOB_COLLECTION_NAME = "dkhptdJob";
module.exports.ACCOUNT_COLLECTION_NAME = "account";
module.exports.DOING = "doing";
module.exports.PING = "ping";
module.exports.APP_ID = `dkhptd${Date.now()}`;
