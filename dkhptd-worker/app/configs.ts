import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from "puppeteer-core";
import { toJson } from "./utils";

const DEFAULT_TMP_DIR = "./tmp/";
const DEFAULT_LOG_DIR = "./logs/";
const DEFAULT_JOB_DIR = "./dist/jobs/";
const DEFAULT_SCHEDULES_DIR = "./schedules.tmp/";
const DEFAULT_USER_DATA_DIR = "./userdata.tmp/";

export class Config {
  configFile?: string = "config.json";
  workerId?: string = String(Date.now());
  workerType?: string = "";
  tmpDir?: string = DEFAULT_TMP_DIR;
  logDest?: string = "cs";
  logDir?: string = DEFAULT_LOG_DIR;
  secret?: string = String(Date.now());
  accessToken?: string = "";
  maxTry?: number = 10;
  jobDir?: string = DEFAULT_JOB_DIR;
  scheduleDir?: string = DEFAULT_SCHEDULES_DIR;
  userDataDir?: string = DEFAULT_USER_DATA_DIR;
  httpWorkerPullConfigUrl?: string = "";
  rabbitmqConnectionString?: string = "";
  amqpEncryptionKey?: string = "";
  puppeteerLaunchOption?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
  } = {};
  logWorkerDoing?: boolean = false;

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
  WORKER_PING: "worker-ping",
  WORKER_DOING: "worker-doing",
};

export const QueueName = {
  RUN_JOB: "run-job",
  PROCESS_JOB_RESULT: "process-job-result",

  RUN_JOB_V1: "run-job-v1",
  PROCESS_JOB_V1_RESULT: "process-job-v1-result",

  RUN_JOB_V2: "run-job-v2",
  PROCESS_JOB_V2_RESULT: "process-job-v2-result",
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