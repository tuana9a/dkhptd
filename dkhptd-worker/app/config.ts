import { LaunchOptions } from "puppeteer";
import options from "./common/PuppeteerLaunchOptions";
import toJson from "./common/toJson";
import update from "./common/update";

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
    public puppeteerMode?: string,
    public puppeteerLaunchOption?: LaunchOptions,
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
    this.puppeteerLaunchOption = options.get(this.puppeteerMode);
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
    this.puppeteerMode = this.puppeteerMode || "default";
    this.puppeteerLaunchOption = options.get(this.puppeteerMode);
    return this;
  }
}

const config = new Config();

export default config;
