/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

class Logger {
  handler: {
    info: (...params: any[]) => any;
    warn: (...params: any[]) => any;
    error: (...params: any[]) => any;
  };

  constructor() {
    this.handler = require("./cs").default;
  }

  use(name: string) {
    this.handler = require(`./${name}`).default;
  }

  info(data: any) {
    this.handler.info(data);
  }

  warn(data: any) {
    this.handler.info(data);
  }

  error(err: Error) {
    this.handler.error(err);
  }
}

const logger = new Logger();

export default logger;
