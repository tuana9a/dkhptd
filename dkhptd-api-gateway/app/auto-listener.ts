/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import path from "path";

export const setup = (dir: string) => {
  const filepaths = fs.readdirSync(dir).filter(x => x.endsWith(".js"));
  const loaded = [];

  for (const filepath of filepaths) {
    const relativeFilepath = `${dir}/${filepath}`;
    const stat = fs.statSync(relativeFilepath);

    if (stat.isDirectory()) {
      const childLoaded = setup(relativeFilepath);
      loaded.push(...childLoaded);
    } else {
      require(path.resolve(relativeFilepath)).setup();
      loaded.push(relativeFilepath);
    }
  }

  return loaded;
};
