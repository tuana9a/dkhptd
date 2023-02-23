import fs from "fs";
import amqp from "amqplib/callback_api";
import axios from "axios";
import path from "path";

/* eslint-disable no-param-reassign */
export const toBuffer = (input: string) => Buffer.from(input);
export const toJson = (input, space = 0) => JSON.stringify(input, null, space);
export const toPrettyErr = (err: Error) => ({
  name: err.name,
  message: err.message,
  stack: err.stack.split("\n"),
});
export const update = (origin, target) => {
  if (target) {
    for (const key of Object.keys(origin)) {
      const newValue = target[key];
      if (newValue !== undefined && newValue !== null) {
        origin[key] = newValue;
      }
    }
  }
  return origin;
};
export const ensureDirExists = (dir: string) => {
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
export const assertExchange = (channel: amqp.Channel, name: string, type: string, opts?: amqp.Options.AssertExchange) => channel.assertExchange(name, type, opts);
export const assertQueue = (channel: amqp.Channel, queue?: string, options?: amqp.Options.AssertQueue, callback?: (err, ok: amqp.Replies.AssertQueue) => void) => channel.assertQueue(queue, options, callback);

export const downloadFile = async (url: string, out: string, config = {}) => {
  const writer = fs.createWriteStream(out);
  const response = await axios.get(url, {
    ...config,
    responseType: "stream",
  });
  // ensure that the user can call `then()` only when the file has
  // been downloaded entirely.
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      if (!error) {
        resolve(true);
      }
      // no need to call the reject here, as it will have been called in the
      // 'error' stream;
    });
  });
};
export const downloadJobs = async (url: string, jobDir: string, headers = {}) => {
  const response = await axios.get(url, { headers }).then((res) => res.data);
  const infos = response.data;
  return Promise.all(infos.map((info) => downloadFile(info.downloadUrl, path.join(jobDir, info.fileName), { headers })));
};
