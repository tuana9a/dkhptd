import config from "../config";
import InvalidWorkerTypeError from "../errors/InvalidWorkerTypeError";
import HttpWorker from "../workers/HttpWorker";
import RabbitWorkerV1 from "../workers/RabbitWorkerV1";
import RabbitWorker from "../workers/RabbitWorker";
import RabbitWorkerV2 from "../workers/RabbitWorkerV2";
import StandaloneWorker from "../workers/StandaloneWorker";
import PuppeteerClient from "./PuppeteerClient";
import { Component } from "tu9nioc";

@Component
export default class WorkerController {
  constructor(
    private httpWorker: HttpWorker,
    private rabbitWorker: RabbitWorker,
    private rabbitWorkerV1: RabbitWorkerV1,
    private rabbitWorkerV2: RabbitWorkerV2,
    private standaloneWorker: StandaloneWorker,
    private puppeteerClient: PuppeteerClient
  ) {
  }

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
