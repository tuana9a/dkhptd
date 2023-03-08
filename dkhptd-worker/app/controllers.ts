import fs from "fs";
import osiax from "axios";
import FormData from "form-data";
import { isValidJob } from "puppeteer-worker-job-builder";
import { Component } from "tu9nioc";

import { cfg } from "./configs";
import { JobNotFoundError, InvalidJobInfoError, InvalidWorkerTypeError } from "./errors";
import { PuppeteerWorker } from "puppeteer-worker";
import { SupportJobsDb } from "./repos";
import { JobRequest } from "./types";
import { HttpWorker } from "./workers/HttpWorker";
import { RabbitWorkerV1 } from "./workers/RabbitWorkerV1";
import { StandaloneWorker } from "./workers/StandaloneWorker";
import { RabbitWorker } from "./workers/RabbitWorker";
import logger from "./logger";
import { toJson } from "./utils";

const axios = osiax.create();

@Component
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

@Component
export default class WorkerController {
  constructor(
    private httpWorker: HttpWorker,
    private rabbitWorker: RabbitWorker,
    private rabbitWorkerV1: RabbitWorkerV1,
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

  http() {
    return this.httpWorker;
  }

  standalone() {
    return this.standaloneWorker;
  }
}
