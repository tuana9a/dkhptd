const config = require("../config");
const InvalidWorkerTypeError = require("../errors/InvalidWorkerTypeError");

class WorkerController {
  httpWorker;

  rabbitWorker;

  rabbitWorkerV1;

  rabbitWorkerV2;

  standaloneWorker;

  puppeteerClient;

  puppeteer() {
    return this.puppeteerClient;
  }

  auto() {
    if (!this[config.workerType]) {
      throw new InvalidWorkerTypeError(config.workerType);
    }
    return this[config.workerType]();
  }

  rabbit() {
    return this.getRabbitWorker();
  }

  rabbit_v1() {
    return this.getRabbitWorkerV1();
  }

  rabbit_v2() {
    return this.getRabbitWorkerV2();
  }

  http() {
    return this.getHttpWorker();
  }

  standalone() {
    return this.getStandaloneWorker();
  }
}

module.exports = WorkerController;
