const fs = require("fs");
const path = require("path");
const ScheduleDirNotExistsError = require("../errors/ScheduleDirNotExistError");
const loop = require("../loop");
const logger = require("../loggers/logger");
const config = require("../config");
const toJson = require("../common/toJson");

class StandaloneWorker {
  puppeteerWorkerController;

  async start() {
    const puppeteerWorkerController = this.getPuppeteerWorkerController();
    const dir = config.scheduleDir;

    if (!fs.existsSync(dir)) {
      throw new ScheduleDirNotExistsError(dir);
    }

    const files = fs.readdirSync(dir).filter((x) => x.endsWith(".json"));
    const schedules = [];

    for (const filepath of files) {
      const absoluteFilepath = path.resolve(dir, filepath);
      const job = JSON.parse(fs.readFileSync(absoluteFilepath, { flag: "r", encoding: "utf-8" }));
      logger.info(`Schedule: loaded: ${toJson(job, 2)}`);
      schedules.push(job);
    }
    schedules.sort((x1, x2) => x1.timeToStart - x2.timeToStart);

    loop.infinity(async () => {
      const jobInfo = schedules[0];
      if (!jobInfo) process.exit(0); // empty job
      if (Date.now() < jobInfo.timeToStart) return; // not it's time yet
      schedules.shift();
      try {
        const logs = await puppeteerWorkerController.do(jobInfo);
        logger.info(logs);
      } catch (err) {
        logger.error(err);
      }
    }, 5000);
  }
}

module.exports = StandaloneWorker;
