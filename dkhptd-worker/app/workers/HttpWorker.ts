import oxias from "axios";
import toPrettyErr from "../common/toPrettyErr";
import loop from "../loop";
import logger from "../loggers/logger";
import config from "../config";
import toJson from "../common/toJson";
import PuppeteerWorkerController from "../controllers/PuppeteerWorkerController";
import { Component } from "tu9nioc";

const axios = oxias.create();

@Component
export default class HttpWorker {
  constructor(private puppeteerWorkerController: PuppeteerWorkerController) { }

  async start() {
    const puppeteerWorkerController = this.puppeteerWorkerController;
    const httpWorkerConfig = await axios.get(config.httpWorkerPullConfigUrl, { headers: { Authorization: config.accessToken } }).then((res) => res.data);
    const { pollJobUrl, submitJobResultUrl, repeatPollJobsAfter } = httpWorkerConfig;
    loop.infinity(async () => {
      const jobInfo = await axios.get(pollJobUrl, { headers: { Authorization: config.accessToken } }).then((res) => res.data).catch((err) => logger.error(err));
      if (!jobInfo) {
        return;
      }
      try {
        const logs = await puppeteerWorkerController.do(jobInfo);
        const body = { id: jobInfo.id, workerId: config.workerId, logs };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: config.accessToken,
          },
        }).catch((err) => logger.error(err));
      } catch (err) {
        logger.error(err);
        const body = { workerId: config.workerId, err: toPrettyErr(err) };
        axios.post(submitJobResultUrl, toJson(body), {
          headers: {
            "Content-Type": "application/json",
            Authorization: config.accessToken,
          },
        }).catch((err1) => logger.error(err1));
      }
    }, repeatPollJobsAfter);
  }
}
