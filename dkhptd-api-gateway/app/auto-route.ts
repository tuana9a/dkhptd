/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import express from "express";
import logger from "./loggers/logger";

export const setup = (dir: string) => {
  const filepaths = fs.readdirSync(dir).filter(x => !x.endsWith(".ts"));
  const router = express.Router();
  const loadedPaths = [];

  for (const filepath of filepaths) {
    const relativeFilepath = `${dir}/${filepath}`;
    loadedPaths.push(relativeFilepath);
    router.use(require(path.resolve(relativeFilepath)).router);
  }

  logger.info(`Loaded routes:\n${loadedPaths.join("\n")}`);

  return router;
};
