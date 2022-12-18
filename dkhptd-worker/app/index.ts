/* eslint-disable global-require */

import fs from "fs";
import path from "path";
import { ioc } from "tu9nioc";
import { default as PuppeteerWorker } from "puppeteer-worker";
import { isValidJob } from "puppeteer-worker-job-builder";

import SupportJobsDb from "./repositories/SupportJobsDb";
import WorkerController from "./controllers/WorkerController";
import PuppeteerDisconnectedError from "./errors/PuppeteerDisconnectedError";
import logger from "./loggers/logger";
import loadConfig from "./loadConfig";
import prepareWorkDirs from "./prepareWorkDirs";
import { JobSupplier } from "./types";
import { Config } from "./config";

export async function launch(initConfig: Config) {
  ioc.scan("dist/");
  ioc.addClass(PuppeteerWorker, "puppeteerWorker");
  ioc.di();

  const workerController: WorkerController = ioc.getBean("workerController").getInstance();
  const config = loadConfig(initConfig);
  const supportJobsDb: SupportJobsDb = ioc.getBean("supportJobsDb").getInstance();
  const lengthOfJs = ".js".length;

  prepareWorkDirs();

  const loadedJobs = [];
  fs.readdirSync(config.jobDir)
    .filter((x) => x.endsWith(".js"))
    .map((x) => `../${path.join(config.jobDir, x)}`)
    .map((filepath) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    .forEach((job: { filepath: string; supplier: JobSupplier }) => {
      const name = job.filepath.slice(job.filepath.lastIndexOf("/") + 1, -(lengthOfJs));
      loadedJobs.push({ name, filepath: job.filepath });
      supportJobsDb.update(name, job.supplier);
    });

  logger.info(`Loaded Jobs:\n${loadedJobs.reduce((a, c) => `${a}${c.name} -> ${c.filepath}\n`, "")}`);

  await workerController.puppeteer().launch();

  workerController.puppeteer().onDisconnect(() => logger.error(new PuppeteerDisconnectedError()));
  workerController.puppeteer().onDisconnect(() => setTimeout(() => process.exit(0), 100));

  await workerController.auto().start();

  return workerController;
}
