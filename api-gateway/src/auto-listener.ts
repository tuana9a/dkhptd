/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import logger from "./loggers/logger";
import { toJson } from "./utils";

export const setup = (dir: string) => {
  const filepaths = fs.readdirSync(dir).filter(x => x.endsWith(".js"));
  const loadedPaths = [];
  for (const filepath of filepaths) {
    const relativeFilepath = path.join(dir, filepath);
    require(path.resolve(relativeFilepath)).setup();
    loadedPaths.push(relativeFilepath);
  }
  logger.info(`Loaded listeners: ${toJson(loadedPaths)}`);
  return loadedPaths;
};
