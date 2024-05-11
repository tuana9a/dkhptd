import { BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Product } from "puppeteer-core";

const DEFAULT_TMP_DIR = "./tmp/";
const DEFAULT_LOG_DIR = "./logs/";
const DEFAULT_JOB_DIR = "./dist/jobs/";
const DEFAULT_SCHEDULES_DIR = "./schedules.tmp/";
const DEFAULT_USER_DATA_DIR = "./userdata.tmp/";
const DEFAULT_LOG_DEST = "cs";

export class Config {
  id?: string = String(Date.now());
  type?: string = "";
  logDest?: string = DEFAULT_LOG_DEST;
  jobDir?: string = DEFAULT_JOB_DIR;
  tmpDir?: string = DEFAULT_TMP_DIR;
  logDir?: string = DEFAULT_LOG_DIR;
  logWorkerDoing?: boolean = false;
  puppeteerLaunchOptions?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
  } = {};
  // standalone worker
  schedulesDir?: string = DEFAULT_SCHEDULES_DIR;
  // rabbit worker
  rabbitmqConnectionString?: string = "";
  amqpEncryptionKey?: string = "";

  toJson() {
    return {
      ...this,
    };
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
  c.id = c.id || `worker${Date.now()}`;
  c.tmpDir = c.tmpDir || DEFAULT_TMP_DIR;
  c.schedulesDir = c.schedulesDir || DEFAULT_SCHEDULES_DIR;
  c.logDir = c.logDir || DEFAULT_LOG_DIR;
  c.logDest = c.logDest || DEFAULT_LOG_DEST;
  c.puppeteerLaunchOptions = c.puppeteerLaunchOptions || {};
  c.puppeteerLaunchOptions.userDataDir = c.puppeteerLaunchOptions.userDataDir || DEFAULT_USER_DATA_DIR;
  return c;
};