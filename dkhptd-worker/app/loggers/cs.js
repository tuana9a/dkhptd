/* eslint-disable no-console */
const moment = require("moment");

module.exports = {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
