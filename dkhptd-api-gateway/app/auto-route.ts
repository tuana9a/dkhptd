/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";
import express from "express";
import _ from "lodash";

const lenOfDotJs = ".js".length;

export const setup = (dir: string, basePath: string, acc = {}) => {
  const filepaths = fs.readdirSync(dir).filter(x => !x.endsWith(".ts"));
  const rootRouter = express.Router();

  for (const filepath of filepaths) {
    const relativeFilepath = `${dir}/${filepath}`;
    const stat = fs.statSync(relativeFilepath);

    if (stat.isDirectory()) {
      const usePath = `/${basePath}`;
      const nestedAcc = {};
      const router = setup(relativeFilepath, filepath, nestedAcc);
      _.set(acc, filepath, nestedAcc);
      rootRouter.use(usePath, router);
    } else {
      const router = require(path.resolve(relativeFilepath)).default;
      if (filepath == "index.js") {
        const usePath = `/${basePath}`;
        rootRouter.use(usePath, router);
        _.set(acc, "<index>", relativeFilepath);
      } else {
        const p = filepath.slice(0, -lenOfDotJs);
        const usePath = `/${path.join(basePath, p)}`;
        rootRouter.use(usePath, router);
        _.set(acc, p, relativeFilepath);
      }
    }
  }

  return rootRouter;
};
