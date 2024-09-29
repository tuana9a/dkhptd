import fs from "fs";
import path from "path";
import oxias from "axios";
import FormData from "form-data";
import _ from "lodash";

import { Browser } from "puppeteer-core";
import { AvailableJobs } from "./repos";
import { JobRequest, DoingInfo, Context } from "./types";
import { InvalidJobInfoError, JobNotFoundError } from "./errors";
import logger from "./logger";
import { toJson, toPrettyErr } from "./utils";
import { cfg } from "./configs";

const axios = oxias.create();

export class PuppeteerWorker {
  private browser: Browser;

  constructor(private availableJobs: AvailableJobs) { }

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  getBrowser() {
    return this.browser;
  }

  async getPage(index: number) {
    const pages = await this.browser.pages();
    return pages[index];
  }

  async getFirstPage() {
    return this.getPage(0);
  }

  async process(request: JobRequest, opts: { onDoing?: (info: DoingInfo) => unknown } = {}) {
    if (!request) throw new InvalidJobInfoError(request);
    const job = this.availableJobs.get(request.name);
    if (!job) throw new JobNotFoundError(request.name);

    const page = await this.getFirstPage();
    const params = {
      username: request.username,
      password: request.password,
      classIds: request.classIds,
    };
    const libs = {
      fs,
      axios,
      FormData,
      _,
      path,
    };
    const utils = {
      toPrettyErr,
    }

    logger.info(`Start job ${request.name} params ${toJson(params)}`);
    const context = new Context({
      workDir: cfg.tmpDir,
      page: page,
      libs: libs,
      params: params,
      utils: utils,
      onDoing: opts?.onDoing,
    });
    const output = await job(context);
    return output;
  }
}
