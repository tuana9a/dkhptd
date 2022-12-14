const config = require("../config");
const ensureDirExists = require("./ensureDirExists");

module.exports = () => {
  ensureDirExists(config.tmpDir);
  ensureDirExists(config.logDir);
};
