import fs from "fs";
import osiax from "axios";
import FormData from "form-data";
import { InvalidJobError, isValidJob } from "puppeteer-worker-job-builder";

import JobNotFoundError from "../errors/JobNotFoundError";
import InvalidJobInfoError from "../errors/InvalidJobInfoError";
import PuppeteerClient from "./PuppeteerClient";
import PuppeteerWorker from "puppeteer-worker";
import SupportJobsDb from "../repositories/SupportJobsDb";
import { Component } from "tu9nioc";
import { JobInfo } from "../types";

const axios = osiax.create();

@Component
export default class PuppeteerWorkerController {
  constructor(
    private puppeteerClient: PuppeteerClient,
    private puppeteerWorker: PuppeteerWorker,
    private supportJobsDb: SupportJobsDb
  ) {

  }

  async do(jobInfo: JobInfo, onDoing = null) {
    if (!jobInfo) {
      throw new InvalidJobInfoError(jobInfo);
    }

    const supportJobsDb = this.supportJobsDb;
    const supplier = supportJobsDb.get(jobInfo.name);

    if (!supplier) {
      throw new JobNotFoundError(jobInfo.name);
    }

    const job = supplier();

    if (!isValidJob(job)) {
      throw new InvalidJobError(job.name);
    }

    const puppeteerClient = this.puppeteerClient;
    const puppeteerWorker = this.puppeteerWorker;

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
