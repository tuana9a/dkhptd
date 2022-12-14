const path = require("path");
const axios = require("axios");
const logger = require("../loggers/logger");
const downloadFile = require("../common/downloadFile");

module.exports = async (url, jobDir, headers = {}) => {
  const response = await axios.get(url, { headers }).then((res) => res.data);
  const infos = response.data;
  await Promise.all(infos.map((info) => downloadFile(info.downloadUrl, path.join(jobDir, info.fileName), { headers }).then(() => logger.info(`Downloading Job: ${info.key}`))));
};
