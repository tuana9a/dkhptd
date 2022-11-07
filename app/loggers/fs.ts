import fs from "fs";
import moment from "moment";
import config from "../config";

export default {
  info: (data: any) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD hh:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data: any) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD hh:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error: any) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    const filepath = `${config.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
