const fs = require("fs");
const logger = require("../loggers/logger");
const config = require("../config");

module.exports = (newConfig) => {
  if (newConfig) {
    if (newConfig.configFile) {
      const data = fs.readFileSync(newConfig.configFile, { flag: "r", encoding: "utf-8" });
      const object = JSON.parse(data);
      config.update(object);
    }
    config.update(newConfig);
    config.defaultify();
    logger.use(config.logDest);
    logger.info(config.toString());
  }
  return config;
};
