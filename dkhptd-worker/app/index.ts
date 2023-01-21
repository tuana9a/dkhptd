/* eslint-disable global-require */

import fs from "fs";
import path from "path";
import { ioc } from "tu9nioc";
import { ensurePageCount, PuppeteerWorker } from "puppeteer-worker";
import { isValidJob } from "puppeteer-worker-job-builder";

import { SupportJobsDb } from "./repos";
import WorkerController from "./controllers";
import { PuppeteerDisconnectedError } from "./errors";
import logger from "./logger";
import loadConfig from "./loadConfig";
import { ensureDirExists } from "./utils";
import { JobSupplier } from "./types";
import { cfg, Config } from "./configs";

export async function launch(initConfig: Config) {
  ioc.scan("dist/");
  ioc.addClass(PuppeteerWorker, "puppeteerWorker", { ignoreDeps: ["browser"] });
  ioc.di();

  const config = loadConfig(initConfig);

  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);

  const workerController: WorkerController = ioc.getBean("workerController").getInstance();
  const supportJobsDb: SupportJobsDb = ioc.getBean("supportJobsDb").getInstance();
  const lengthOfJs = ".js".length;
  const loadedJobs = [];

  fs.readdirSync(config.jobDir)
    .filter((x) => x.endsWith(".js"))
    .map((x) => `../${path.join(config.jobDir, x)}`)
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
      const name = job.filepath.slice(job.filepath.lastIndexOf("/") + 1, -(lengthOfJs));
      loadedJobs.push({ name, filepath: job.filepath });
      supportJobsDb.update(name, job.supplier);
    });

  logger.info(`Loaded Jobs:\n${loadedJobs.reduce((a, c) => `${a}${c.name} -> ${c.filepath}\n`, "")}`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browser = await require("puppeteer-core").launch(config.puppeteerLaunchOption);
  await ensurePageCount(browser, 1);

  const puppeteerWorker: PuppeteerWorker = ioc.getBean(PuppeteerWorker).getInstance();
  puppeteerWorker.setBrowser(browser);

  browser.on("disconnected", () => logger.info("exiting..."));
  browser.on("disconnected", () => logger.error(new PuppeteerDisconnectedError()));
  browser.on("disconnected", () => setTimeout(() => process.exit(0), 1000));

  await workerController.auto().start();

  return workerController;
}
