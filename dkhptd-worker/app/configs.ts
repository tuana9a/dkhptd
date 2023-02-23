import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from "puppeteer-core";
import { toJson } from "./utils";

const DEFAULT_TMP_DIR = "./tmp/";
const DEFAULT_LOG_DIR = "./logs/";
const DEFAULT_JOB_DIR = "./dist/jobs/";
const DEFAULT_SCHEDULES_DIR = "./schedules.tmp/";
const DEFAULT_USER_DATA_DIR = "./userdata.tmp/";

export class Config {
  constructor(
    public configFile?: string,
    public workerId?: string,
    public workerType?: string,
    public tmpDir?: string,
    public logDest?: string,
    public logDir?: string,
    public secret?: string,
    public accessToken?: string,
    public maxTry?: number,
    public jobDir?: string,
    public scheduleDir?: string,
    public userDataDir?: string,
    public httpWorkerPullConfigUrl?: string,
    public rabbitmqConnectionString?: string,
    public amqpEncryptionKey?: string,
    public puppeteerLaunchOption?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
      product?: Product;
      extraPrefsFirefox?: Record<string, unknown>;
    },
  ) {
    this.tmpDir = DEFAULT_TMP_DIR;
    this.logDir = DEFAULT_LOG_DIR;
    this.jobDir = DEFAULT_JOB_DIR;
    this.scheduleDir = DEFAULT_SCHEDULES_DIR;
    this.userDataDir = DEFAULT_USER_DATA_DIR;
  }

  toJson() {
    return {
      ...this,
    };
  }

  toString() {
    const output = ["Config: "];
    for (const key of Object.keys(this)) {
      const value = this[key];
      output.push(`${key} = ${toJson(value, 2)}`);
    }
    return output.join("\n");
  }
}

export const cfg = new Config();

export const ExchangeName = {
  WORKER_PING: "dkhptd.worker-ping",
  WORKER_DOING: "dkhptd.worker-doing",
};

export const QueueName = {
  RUN_JOB: "dkhptd.run-job",
  PROCESS_JOB_RESULT: "dkhptd.process-job-result",

  RUN_JOB_V1: "dkhptd.run-job-v1",
  PROCESS_JOB_V1_RESULT: "dkhptd.process-job-v1-result",

  RUN_JOB_V2: "dkhptd.run-job-v2",
  PROCESS_JOB_V2_RESULT: "dkhptd.process-job-v2-result",
};

export const correctConfig = (c: Config) => {
  c.workerId = c.workerId || `worker${Date.now()}`;
  c.workerType = c.workerType || "http";
  c.tmpDir = c.tmpDir || DEFAULT_TMP_DIR;
  c.scheduleDir = c.scheduleDir || DEFAULT_SCHEDULES_DIR;
  c.userDataDir = c.userDataDir || DEFAULT_USER_DATA_DIR;
  c.logDir = c.logDir || DEFAULT_LOG_DIR;
  c.logDest = c.logDest || "cs";
  c.maxTry = c.maxTry || 10;
  c.puppeteerLaunchOption = c.puppeteerLaunchOption || {};
  c.puppeteerLaunchOption.userDataDir = c.puppeteerLaunchOption.userDataDir || c.userDataDir;
  return c;
};