import fs from "fs";
import osiax from "axios";
import FormData from "form-data";
import { isValidJob } from "puppeteer-worker-job-builder";
import { Component } from "tu9nioc";

import { cfg } from "./configs";
import { JobNotFoundError, InvalidJobInfoError, InvalidWorkerTypeError } from "./errors";
import { PuppeteerWorker } from "puppeteer-worker";
import { SupportJobsDb } from "./repos";
import { JobInfo } from "./types";
import { HttpWorker, RabbitWorker, RabbitWorkerV1, RabbitWorkerV2, StandaloneWorker } from "./workers";

const axios = osiax.create();

@Component
export class PuppeteerWorkerController {
  constructor(private puppeteerWorker: PuppeteerWorker, private supportJobsDb: SupportJobsDb) { }

  async do(info: JobInfo, onDoing = null) {
    if (!info) {
      throw new InvalidJobInfoError(info);
    }

    const supportJobsDb = this.supportJobsDb;
    const supplier = supportJobsDb.get(info.name);

    if (!supplier) {
      throw new JobNotFoundError(info.name);
    }

    const job = supplier();

    if (!isValidJob(job)) {
      throw new Error(`Invalid job: ${job.name}`);
    }

    const puppeteerWorker = this.puppeteerWorker;

    job.params = info.params;
    job.libs = {
      fs,
      axios,
      FormData,
    };

    const output = await puppeteerWorker.do(job, { onDoing: onDoing });
    return output;
  }
}

@Component
export default class WorkerController {
  constructor(
    private httpWorker: HttpWorker,
    private rabbitWorker: RabbitWorker,
    private rabbitWorkerV1: RabbitWorkerV1,
    private rabbitWorkerV2: RabbitWorkerV2,
    private standaloneWorker: StandaloneWorker,
  ) {
  }

  auto() {
    if (!this[cfg.workerType]) {
      throw new InvalidWorkerTypeError(cfg.workerType);
    }
    return this[cfg.workerType]();
  }

  rabbit() {
    return this.rabbitWorker;
  }

  rabbit_v1() {
    return this.rabbitWorkerV1;
  }

  rabbit_v2() {
    return this.rabbitWorkerV2;
  }

  http() {
    return this.httpWorker;
  }

  standalone() {
    return this.standaloneWorker;
  }
}
