const fs = require("fs");

module.exports = (dir) => {
  if (!dir) return;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
