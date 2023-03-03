/* eslint-disable no-console */
import moment from "moment";

export default {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} [INFO] ${msg}`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} [WARN] ${msg}`);
  },
  error: (error: Error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}`);
  },
};
