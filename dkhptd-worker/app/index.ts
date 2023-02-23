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
import { ensureDirExists, update } from "./utils";
import { JobSupplier } from "./types";
import { cfg, Config, correctConfig } from "./configs";

export async function launch(initConfig: Config) {
  ioc.scan("dist/");
  ioc.addClass(PuppeteerWorker, "puppeteerWorker", { ignoreDeps: ["browser"] });
  ioc.di();

  if (initConfig.configFile) {
    update(cfg, JSON.parse(fs.readFileSync(initConfig.configFile, { flag: "r", encoding: "utf-8" })));
  }
  update(cfg, initConfig);
  correctConfig(cfg);

  logger.use(cfg.logDest);
  logger.info(cfg.toString());
  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);
  ensureDirExists(cfg.userDataDir);

  const workerController: WorkerController = ioc.getBean("workerController").getInstance();
  const supportJobsDb: SupportJobsDb = ioc.getBean("supportJobsDb").getInstance();
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

  logger.info(`Loaded Jobs:\n${loadedJobs.reduce((a, c) => `${a}${c.name} -> ${c.filepath}\n`, "")}`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browser = await require("puppeteer-core").launch(cfg.puppeteerLaunchOption);
  await ensurePageCount(browser, 1);

  const puppeteerWorker: PuppeteerWorker = ioc.getBean(PuppeteerWorker).getInstance();
  puppeteerWorker.setBrowser(browser);

  browser.on("disconnected", () => logger.info("exiting..."));
  browser.on("disconnected", () => logger.error(new PuppeteerDisconnectedError()));
  browser.on("disconnected", () => setTimeout(() => process.exit(0), 1000));

  await workerController.auto().start();

  return workerController;
}
