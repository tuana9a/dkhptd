/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import { toJson } from "./utils";
import logger from "./loggers/logger";

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
