/* eslint-disable global-require */

export class Logger {
  handler: {
    info: (data) => void;
    warn: (data) => void;
    error: (err: Error) => void;
  };

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.handler = require("./loggers/cs").default;
  }

  use(name) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.handler = require(`./loggers/${name}`).default;
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
