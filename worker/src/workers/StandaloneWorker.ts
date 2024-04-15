import fs from "fs";
import path from "path";
import { cfg } from "../configs";
import { PuppeteerWorkerController } from "../controllers";
import { ScheduleDirNotExistsError } from "../errors";
import logger from "../logger";
import loop from "../loop";
import { toJson } from "../utils";

export class StandaloneWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  async start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    const dir = cfg.schedulesDir;

    if (!fs.existsSync(dir)) {
      throw new ScheduleDirNotExistsError(dir);
    }

    const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json"));
    const schedules = [];

    for (const filepath of files) {
      const absoluteFilepath = path.resolve(dir, filepath);
      const job = JSON.parse(fs.readFileSync(absoluteFilepath, { flag: "r", encoding: "utf-8" }));
      logger.info(`Schedule ${toJson(job, 2)}`);
      schedules.push(job);
    }
    schedules.sort((x1, x2) => x1.timeToStart - x2.timeToStart);

    loop.infinity(async () => {
      const jobInfo = schedules[0];
      if (!jobInfo) process.exit(0); // empty job
      if (Date.now() < jobInfo.timeToStart) return; // not it's time yet
      schedules.shift();
      try {
        const output = await puppeteerWorkerController.do(jobInfo);
        logger.info(output);
      } catch (err) {
        logger.error(err);
      }
    }, 5000);
  }
}
