import fs from "fs";
import logger from "./logger";
import { cfg } from "./configs";
import { Config } from "./configs";

export default (newConfig: Config) => {
  if (newConfig) {
    if (newConfig.configFile) {
      const data = fs.readFileSync(newConfig.configFile, { flag: "r", encoding: "utf-8" });
      const object = JSON.parse(data);
      cfg.update(object);
    }
    cfg.update(newConfig);
    cfg.defaultify();
    logger.use(cfg.logDest);
    logger.info(cfg.toString());
  }
  return cfg;
};
