const options = require("./common/PuppeteerLaunchOptions");
const toJson = require("./common/toJson");
const update = require("./common/update");

class Config {
  constructor() {
    this.configFile = undefined;

    this.workerId = undefined;
    this.workerType = undefined;
    this.tmpDir = "./tmp/";

    this.logDest = undefined;
    this.logDir = "./logs/";

    this.secret = undefined;
    this.accessToken = undefined;
    this.maxTry = undefined;

    this.jobDir = "./jobs/";
    this.scheduleDir = "./schedules/";

    this.httpWorkerPullConfigUrl = undefined;

    this.rabbitmqConnectionString = undefined;
    this.amqpEncryptionKey = undefined;

    this.puppeteerMode = undefined;
    this.puppeteerLaunchOption = undefined;
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
    this.maxTry = parseInt(this.maxTry, 10);
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
    this.maxTry = parseInt(this.maxTry, 10) || 10;
    this.puppeteerMode = this.puppeteerMode || "default";
    this.puppeteerLaunchOption = options.get(this.puppeteerMode);
    return this;
  }
}

const config = new Config();

module.exports = config;
