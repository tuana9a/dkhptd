import path from "path";
import axios from "axios";
import logger from "./loggers/logger";
import downloadFile from "./common/downloadFile";

export default async (url: string, jobDir: string, headers = {}) => {
  const response = await axios.get(url, { headers }).then((res) => res.data);
  const infos = response.data;
  await Promise.all(infos.map((info) => downloadFile(info.downloadUrl, path.join(jobDir, info.fileName), { headers }).then(() => logger.info(`Downloading Job: ${info.key}`))));
};
