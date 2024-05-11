/* eslint-disable global-require */

import fs from "fs";
import path from "path";
import { PuppeteerWorker } from "./puppeteer-worker";
import { isValidJob } from "./job-builder";

import { SupportJobsDb } from "./repos";
import WorkerController, { PuppeteerWorkerController } from "./controllers";
import { PuppeteerDisconnectedError } from "./errors";
import logger from "./logger";
import { ensureDirExists, update, ensurePageCount, toJson } from "./utils";
import { JobSupplier } from "./types";
import { cfg, Config, correctConfig } from "./configs";
import { RabbitWorkerV1 } from "./workers/RabbitWorkerV1";
import { StandaloneWorker } from "./workers/StandaloneWorker";
import { RabbitWorker } from "./workers/RabbitWorker";
import { Browser } from "puppeteer-core";

export async function launch(initConfig: Config) {
  update(cfg, initConfig);
  correctConfig(cfg);
  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);
  ensureDirExists(cfg.puppeteerLaunchOptions.userDataDir);

  logger.use(cfg.logDest);
  logger.info(`Config: ${toJson(cfg)}`);
  const puppeteerWorker = new PuppeteerWorker();
  const supportJobsDb = new SupportJobsDb();
  const puppeteerWorkerController = new PuppeteerWorkerController(puppeteerWorker, supportJobsDb);
  const rabbitWorker = new RabbitWorker(puppeteerWorkerController);
  const rabbitWorkerV1 = new RabbitWorkerV1(puppeteerWorkerController);
  const standaloneWorker = new StandaloneWorker(puppeteerWorkerController);
  const workerController = new WorkerController(rabbitWorker, rabbitWorkerV1, standaloneWorker);
  const lengthOfJs = ".js".length;
  const loadedJobs = [];

  fs.readdirSync(cfg.jobDir)
    .filter((x) => x.endsWith(".js"))
    .map((x) => `../${path.join(cfg.jobDir, x)}`)
    .map((filepath) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const supplier = require(filepath).default;
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
    .forEach((job: { filepath: string; supplier: JobSupplier }) => {
      const name = path.basename(job.filepath).slice(0, -(lengthOfJs));
      loadedJobs.push({ name, filepath: job.filepath });
      supportJobsDb.update(name, job.supplier);
    });

  logger.info(`Loaded Jobs: ${loadedJobs.map(x => `${x.name} -> ${x.filepath}`).join(",")}`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browser: Browser = await require("puppeteer-core").launch(cfg.puppeteerLaunchOptions);
  await ensurePageCount(browser, 1);
  const pages = await browser.pages();
  // init userdata
  await pages[0].goto("http://dk-sis.hust.edu.vn/");
  await pages[0].reload();
  puppeteerWorker.setBrowser(browser);

  browser.on("disconnected", () => logger.error(new PuppeteerDisconnectedError()));
  browser.on("disconnected", () => setTimeout(() => process.exit(0), 1000));

  await workerController.auto().start();

  return workerController;
}
