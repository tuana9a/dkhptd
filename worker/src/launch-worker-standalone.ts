import fs from "fs";
import path from "path";
import { ScheduleDirNotExistsError } from "./errors";
import loop from "./loop";

import { PuppeteerWorker } from "./puppeteer-worker";
import { AvailableJobs } from "./repos";
import { PuppeteerDisconnectedError } from "./errors";
import logger from "./logger";
import { ensureDirExists, update, ensurePageCount, toJson } from "./utils";
import { cfg, Config, correctConfig, puppeteerLaunchOptions } from "./configs";
import { Browser } from "puppeteer-core";
import DangKyLopTuDong from "./jobs/DangKyLopTuDong";

export async function launch(initConfig: Config) {
  update(cfg, initConfig);
  correctConfig(cfg);
  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);
  ensureDirExists(cfg.puppeteerLaunchOptions.userDataDir);

  logger.use(cfg.logDest);
  logger.info(`Config: ${toJson(cfg)}`);
  const availableJobs = new AvailableJobs();
  const puppeteerWorker = new PuppeteerWorker(availableJobs);

  availableJobs.update("DangKyLopTuDong", DangKyLopTuDong);
  availableJobs.update("DangKyHocPhanTuDong", DangKyLopTuDong);
  availableJobs.update("DangKyHocPhanTuDongV1", DangKyLopTuDong);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const browser: Browser = await require("puppeteer-core").launch(cfg.puppeteerLaunchOptions);
  await ensurePageCount(browser, 1);
  puppeteerWorker.setBrowser(browser);

  browser.on("disconnected", () => logger.error(new PuppeteerDisconnectedError()));
  browser.on("disconnected", () => setTimeout(() => process.exit(1), 1000));

  const dir = cfg.schedulesDir;

  if (!fs.existsSync(dir)) throw new ScheduleDirNotExistsError(dir);


  const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json"));
  const schedules = [];

  for (const filepath of files) {
    const absoluteFilepath = path.resolve(dir, filepath);
    const job = JSON.parse(fs.readFileSync(absoluteFilepath, { flag: "r", encoding: "utf-8" }));
    logger.info(`Schedule ${toJson(job)}`);
    schedules.push(job);
  }
  schedules.sort((x1, x2) => x1.timeToStart - x2.timeToStart);

  loop.infinity(async () => {
    const jobInfo = schedules[0];
    if (!jobInfo) process.exit(0); // empty job
    if (Date.now() < jobInfo.timeToStart) return; // not it's time yet
    schedules.shift();
    try {
      const output = await puppeteerWorker.process(jobInfo);
      logger.info(output);
    } catch (err) {
      logger.error(err);
    }
  }, 5000);
}

launch({
  id: process.env.ID,
  logDest: process.env.LOG_DEST || "cs",
  jobDir: process.env.JOB_DIR || "./dist/jobs",
  logWorkerDoing: Boolean(process.env.LOG_WORKER_DOING) || false,
  puppeteerLaunchOptions: puppeteerLaunchOptions[process.env.PUPPETEER_LAUNCH_OPTIONS_TYPE] || puppeteerLaunchOptions["linux-headless"],
  rabbitmqConnectionString: process.env.RABBITMQ_CONNECTION_STRING,
  amqpEncryptionKey: process.env.AMQP_ENCRYPTION_KEY,
  schedulesDir: process.env.SCHEDULES_DIR,
});

