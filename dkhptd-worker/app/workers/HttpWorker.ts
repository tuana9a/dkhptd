import oxias from "axios";
import { toPrettyErr } from "puppeteer-worker-job-builder";
import { Component } from "tu9nioc";
import { cfg } from "../configs";
import { PuppeteerWorkerController } from "../controllers";
import logger from "../logger";
import loop from "../loop";
import { toJson } from "../utils";


const axios = oxias.create();

@Component
export class HttpWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  async start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    const httpWorkerConfig = await axios.get(cfg.httpWorkerPullConfigUrl, { headers: { Authorization: cfg.accessToken } }).then((res) => res.data);
    const { pollJobUrl, submitJobResultUrl, repeatPollJobsAfter } = httpWorkerConfig;
    loop.infinity(async () => {
      const jobInfo = await axios.get(pollJobUrl, { headers: { Authorization: cfg.accessToken } }).then((res) => res.data).catch((err) => logger.error(err));
      if (!jobInfo) {
        return;
      }
      try {
        const { logs, vars } = await puppeteerWorkerController.do(jobInfo);
        const body = { id: jobInfo.id, workerId: cfg.workerId, logs, vars };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: cfg.accessToken,
          },
        }).catch((err) => logger.error(err));
      } catch (err) {
        logger.error(err);
        const body = { workerId: cfg.workerId, err: toPrettyErr(err) };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: cfg.accessToken,
          },
        }).catch((err1) => logger.error(err1));
      }
    }, repeatPollJobsAfter);
  }
}