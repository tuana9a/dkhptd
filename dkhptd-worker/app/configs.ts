import { update, toJson } from "./utils";

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
    public httpWorkerPullConfigUrl?: string,
    public rabbitmqConnectionString?: string,
    public amqpEncryptionKey?: string,
    public puppeteerLaunchOption?,
  ) {
    this.tmpDir = "./tmp/";
    this.logDir = "./logs/";
    this.jobDir = "./jobs/";
    this.scheduleDir = "./schedules/";
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

  update(object) {
    update(this, object);
    return this;
  }

  defaultify() {
    this.workerId = this.workerId || `worker${Date.now()}`;
    this.workerType = this.workerType || "http";
    this.tmpDir = "./tmp/";
    this.scheduleDir = "./schedules/";
    this.logDir = "./logs/";
    this.logDest = this.logDest || "cs";
    this.maxTry = this.maxTry || 10;
    return this;
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
