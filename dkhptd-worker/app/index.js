/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const fs = require("fs");
const path = require("path");
const { IocContainer } = require("tu9nioc");
const { default: PuppeteerWorker } = require("puppeteer-worker");
const { isValidJob } = require("puppeteer-worker-job-builder");

const PuppeteerWorkerController = require("./controllers/PuppeteerWorkerController");
const PuppeteerClient = require("./controllers/PuppeteerClient");
const SupportJobsDb = require("./repositories/SupportJobsDb");
const WorkerController = require("./controllers/WorkerController");
const HttpWorker = require("./workers/HttpWorker");
const RabbitMQWorker = require("./workers/RabbitMQWorker");
const RabbitMQWorkerV1 = require("./workers/RabbitMQWorkerV1");
const StandaloneWorker = require("./workers/StandaloneWorker");
const PuppeteerDisconnectedError = require("./errors/PuppeteerDisconnectedError");
const logger = require("./loggers/logger");
const loadConfig = require("./controllers/loadConfig");
const prepareWorkDirs = require("./controllers/prepareWorkDirs");
const RabbitMQWorkerV2 = require("./workers/RabbitMQWorkerV2");

async function launch(initConfig) {
  const ioc = new IocContainer({ getter: true });
  ioc.addClass(PuppeteerClient, "puppeteerClient");
  ioc.addClass(PuppeteerWorkerController, "puppeteerWorkerController");
  ioc.addClass(SupportJobsDb, "supportJobsDb", { ignoreDeps: ["db"] });
  ioc.addClass(WorkerController, "workerController");
  ioc.addClass(HttpWorker, "httpWorker");
  ioc.addClass(RabbitMQWorker, "rabbitWorker");
  ioc.addClass(RabbitMQWorkerV1, "rabbitWorkerV1");
  ioc.addClass(RabbitMQWorkerV2, "rabbitWorkerV2");
  ioc.addClass(StandaloneWorker, "standaloneWorker");
  ioc.addBean(new PuppeteerWorker(), "puppeteerWorker");
  ioc.di();

  const workerController = ioc.getBean("workerController").getInstance();
  const config = loadConfig(initConfig);
  const supportJobsDb = ioc.getBean("supportJobsDb").getInstance();
  const lengthOfJs = ".js".length;

  prepareWorkDirs();

  const loadedJobs = [];
  fs.readdirSync(config.jobDir)
    .filter((x) => x.endsWith(".js"))
    .map((x) => `../${path.join(config.jobDir, x)}`)
    .map((filepath) => {
      try {
        const supplier = require(filepath);
        const job = supplier();
        if (isValidJob(job)) {
          return { filepath, supplier };
        }
      } catch (err) {
        logger.error(err);
      }
      return false;
    })
    .filter((x) => x)
    .forEach((job) => {
      const name = job.filepath.slice(job.filepath.lastIndexOf("/") + 1, -(lengthOfJs));
      loadedJobs.push({ filepath: job.filepath, name });
      supportJobsDb.update(name, job.supplier);
    });

  logger.info(`Loaded Jobs: \n${loadedJobs.reduce((a, c) => `${a}${c.filepath} <> ${c.name}\n`, "")}`);

  await workerController.puppeteer().launch();

  workerController.puppeteer().onDisconnect(() => logger.error(new PuppeteerDisconnectedError()));
  workerController.puppeteer().onDisconnect(() => setTimeout(() => process.exit(0), 100));

  await workerController.auto().start();

  return workerController;
}

module.exports.launch = launch;
