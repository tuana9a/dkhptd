const yargs = require("yargs");

require('dotenv').config();

const { launch } = require("./dist");

const parser = yargs
  .usage("Usage: node launch.js")
  .option("id", {
    type: "string",
    requiresArg: false,
  })
  .option("type", {
    type: "string",
    requiresArg: false,
    choices: ["rabbit", "rabbit1", "standalone"],
  })
  .option("job-dir", {
    type: "string",
    requiresArg: false,
    default: "./dist/jobs",
  })
  .option("log-dest", {
    type: "string",
    requiresArg: false,
    choices: ["cs", "fs"],
    default: "cs",
  })
  // setup puppeteer
  .option("puppeteer-launch-options-path", {
    type: "string",
    requiresArg: true,
  })
  // standalone
  .option("schedules-dir", {
    type: "string",
    requiresArg: false,
  })
  // rabbit worker
  .option("rabbitmq-connection-string", {
    type: "string",
    requiresArg: false,
  })
  .option("amqp-encryption-key", {
    type: "string",
    requiresArg: false,
  })
  .option("log-worker-doing", {
    type: "boolean",
    requiresArg: false,
    default: false,
  });

launch({
  id: process.env.ID || parser.argv.id,
  type: process.env.TYPE || parser.argv.type,
  logDest: process.env.LOG_DEST || parser.argv["log-dest"],
  jobDir: process.env.JOB_DIR || parser.argv["job-dir"],
  logWorkerDoing: process.env.LOG_WORKER_DOING || parser.argv["log-worker-doing"],
  puppeteerLaunchOptionsPath: process.env.PUPPETEER_LAUNCH_OPTIONS_PATH || parser.argv["puppeteer-launch-options-path"],
  // rabbit worker
  rabbitmqConnectionString: process.env.RABBITMQ_CONNECTION_STRING || parser.argv["rabbitmq-connection-string"],
  amqpEncryptionKey: process.env.AMQP_ENCRYPTION_KEY || parser.argv["amqp-encryption-key"],
  // standalone
  schedulesDir: process.env.SCHEDULES_DIR || parser.argv["schedules-dir"],
});
