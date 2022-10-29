const moment = require("moment");

module.exports = {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-dd hh:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-dd hh:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-dd hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
