import fs from "fs";
import logger from "./loggers/logger";
import config from "./config";
import { Config } from "./config";

export default (newConfig: Config) => {
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
