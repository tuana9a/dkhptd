import { cfg } from "./configs";
import ensureDirExists from "./ensureDirExists";

export default () => {
  ensureDirExists(cfg.tmpDir);
  ensureDirExists(cfg.logDir);
};
