/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

class Logger {
  constructor() {
    this.handler = require("./cs");
  }

  use(name) {
    this.handler = require(`./${name}`);
  }

  info(data) {
    this.handler.info(data);
  }

  warn(data) {
    this.handler.info(data);
  }

  /**
   * @param {Error} err
   */
  error(err) {
    this.handler.error(err);
  }
}

const logger = new Logger();

module.exports = logger;
