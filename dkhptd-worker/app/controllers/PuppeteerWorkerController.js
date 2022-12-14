const fs = require("fs");
const osiax = require("axios");
const FormData = require("form-data");
const { InvalidJobError, isValidJob } = require("puppeteer-worker-job-builder");

const JobNotFoundError = require("../errors/JobNotFoundError");
const InvalidJobInfoError = require("../errors/InvalidJobInfoError");

const axios = osiax.default.create();

class PuppeteerWorkerController {
  puppeteerClient;

  puppeteerWorker;

  supportJobsDb;

  async do(jobInfo, onDoing = null) {
    if (!jobInfo) {
      throw new InvalidJobInfoError(jobInfo);
    }

    const supportJobsDb = this.getSupportJobsDb();
    const supplier = supportJobsDb.get(jobInfo.name);

    if (!supplier) {
      throw new JobNotFoundError(jobInfo.name);
    }

    const job = supplier();

    if (!isValidJob(job)) {
      throw new InvalidJobError(job.name);
    }

    const puppeteerClient = this.getPuppeteerClient();
    const puppeteerWorker = this.getPuppeteerWorker();

    const page = await puppeteerClient.getFirstPage();
    const libs = {
      fs,
      axios,
      FormData,
    };

    const logs = await puppeteerWorker.do(job, {
      params: jobInfo.params,
      page,
      libs,
      onDoing,
    });
    return logs;
  }
}

module.exports = PuppeteerWorkerController;
