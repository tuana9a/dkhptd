import moment from "moment";

export default {
  info: (data: any) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [INFO] ${msg}\n`);
  },
  warn: (data: any) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [WARN] ${msg}\n`);
  },
  error: (error: any) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split("\n"),
    };
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}\n`);
  },
};
