import fs from "fs";
import moment from "moment";
import { cfg } from "../cfg";

export default {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${cfg.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD HH:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    const filepath = `${cfg.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD HH:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    const filepath = `${cfg.LOG_DIR + moment().format("YYYY-MM-DD")}.log`;
    fs.appendFileSync(filepath, `${moment().format("YYYY-MM-DD HH:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
