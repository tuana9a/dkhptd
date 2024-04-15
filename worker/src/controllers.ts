import fs from "fs";
import osiax from "axios";
import FormData from "form-data";
import { isValidJob } from "./job-builder";

import { cfg } from "./configs";
import { JobNotFoundError, InvalidJobInfoError, InvalidWorkerTypeError } from "./errors";
import { PuppeteerWorker } from "./puppeteer-worker";
import { SupportJobsDb } from "./repos";
import { JobRequest } from "./types";
import { RabbitWorkerV1 } from "./workers/RabbitWorkerV1";
import { StandaloneWorker } from "./workers/StandaloneWorker";
import { RabbitWorker } from "./workers/RabbitWorker";
import logger from "./logger";
import { toJson } from "./utils";

const axios = osiax.create();

export class PuppeteerWorkerController {
  constructor(private puppeteerWorker: PuppeteerWorker, private supportJobsDb: SupportJobsDb) { }

  async do(request: JobRequest, onDoing = null) {
    if (!request) {
      throw new InvalidJobInfoError(request);
    }

    const supportJobsDb = this.supportJobsDb;
    const supplier = supportJobsDb.get(request.name);

    if (!supplier) {
      throw new JobNotFoundError(request.name);
    }

    const job = supplier();

    if (!isValidJob(job)) {
      throw new Error(`Invalid job: ${job.name}`);
    }

    const puppeteerWorker = this.puppeteerWorker;

    job.params = {
      username: request.username,
      password: request.password,
      classIds: request.classIds,
    };
    job.libs = {
      fs,
      axios,
      FormData,
    };

    logger.info(`Start job ${job.name} params ${toJson(job.params)}`);
    const context = await puppeteerWorker.do(job, { onDoing: onDoing });
    return context;
  }
}

export default class WorkerController {
  constructor(
    private rabbitWorker: RabbitWorker,
    private rabbitWorkerV1: RabbitWorkerV1,
    private standaloneWorker: StandaloneWorker,
  ) {
  }

  auto() {
    if (!this[cfg.type]) {
      throw new InvalidWorkerTypeError(cfg.type);
    }
    return this[cfg.type]();
  }

  rabbit() {
    return this.rabbitWorker;
  }

  rabbit1() {
    return this.rabbitWorkerV1;
  }

  standalone() {
    return this.standaloneWorker;
  }
}
