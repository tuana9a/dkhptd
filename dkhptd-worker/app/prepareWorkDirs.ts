import config from "./config";
import ensureDirExists from "./ensureDirExists";

export default () => {
  ensureDirExists(config.tmpDir);
  ensureDirExists(config.logDir);
};
