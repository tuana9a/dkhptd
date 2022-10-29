const fs = require("fs");
const moment = require("moment");
const config = require("../config");

module.exports = {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-dd")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-dd hh:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-dd")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-dd hh:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-dd")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-dd hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
