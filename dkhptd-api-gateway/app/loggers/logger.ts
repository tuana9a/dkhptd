/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

class Logger {
  handler: {
    info: (...params) => void;
    warn: (...params) => void;
    error: (...params) => void;
  };

  constructor() {
    this.handler = require("./cs").default;
  }

  use(name: string) {
    this.handler = require(`./${name}`).default;
  }

  info(data) {
    this.handler.info(data);
  }

  warn(data) {
    this.handler.info(data);
  }

  error(err: Error) {
    this.handler.error(err);
  }
}

const logger = new Logger();

export default logger;
