/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import express from "express";
import logger from "./loggers/logger";
import { toJson } from "./utils";

export const setup = (dir: string) => {
  const filepaths = fs.readdirSync(dir).filter(x => !x.endsWith(".ts"));
  const router = express.Router();
  const loadedPaths = [];
  for (const filepath of filepaths) {
    const relativeFilepath = path.join(dir, filepath);
    router.use(require(path.resolve(relativeFilepath)).router);
    loadedPaths.push(relativeFilepath);
  }
  logger.info(`Loaded routes: ${toJson(loadedPaths)}`);
  return router;
};
