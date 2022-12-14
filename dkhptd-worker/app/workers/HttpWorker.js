const oxias = require("axios");
const toPrettyErr = require("../common/toPrettyErr");
const loop = require("../loop");
const logger = require("../loggers/logger");
const config = require("../config");
const toJson = require("../common/toJson");

const axios = oxias.default.create();

class HttpWorker {
  puppeteerWorkerController;

  async start() {
    const puppeteerWorkerController = this.getPuppeteerWorkerController();
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

module.exports = HttpWorker;
