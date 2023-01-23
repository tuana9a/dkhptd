import moment from "moment";

export default {
  info: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [INFO] ${msg}`);
  },
  warn: (data) => {
    let msg = data;
    if (typeof data === "object") {
      msg = JSON.stringify(data, null, 2);
    }
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [WARN] ${msg}`);
  },
  error: (error) => {
    const msg = {
      name: error.name,
      message: error.message,
      stack: error.stack.split(""),
    };
    // eslint-disable-next-line no-console
    console.log(`${moment().format("YYYY-MM-DD hh:mm:ss")} [ERROR] ${JSON.stringify(msg, null, 2)}`);
  },
};
