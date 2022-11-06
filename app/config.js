const dotenv = require("dotenv");

dotenv.config();

module.exports.SECRET = process.env.SECRET || String(Math.round(Math.random() * Date.now()));
module.exports.BIND = process.env.BIND || "127.0.0.1";
module.exports.PORT = process.env.PORT || 8080;
module.exports.LOG_DIR = process.env.LOG_DIR || "./logs";

module.exports.RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_CONNECTION_STRING || "amqp://localhost:5672";
module.exports.MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017";
module.exports.DATABASE_NAME = "dkhptd";

module.exports.NEW_JOB_EVENT_NAME = "newJob";
module.exports.NEW_JOB_RESULT_EVENT_NAME = "newJobResult";
module.exports.DOING_EVENT_NAME = "doing";
module.exports.PING_EVENT_NAME = "ping";

module.exports.DKHPTD_WORKER_PING_EXCHANGE_NAME = "dkhptd.worker.ping";
module.exports.DKHPTD_WORKER_DOING_EXCHANGE_NAME = "dkhptd.worker.doing";

module.exports.DKHPTD_JOBS_QUEUE_NAME = "dkhptd.jobs";
module.exports.DKHPTD_JOB_RESULT_QUEUE_NAME = "dkhptd.jobs.result";

module.exports.DKHPTD_JOB_COLLECTION_NAME = "dkhptdJob";
module.exports.DKHPTD_JOB_LOGS_COLLECTION_NAME = "dkhptdJobLogs";
module.exports.ACCOUNT_COLLECTION_NAME = "account";
module.exports.LOP_DANG_KY_COLLECTION_NAME = "lopDangKy";
