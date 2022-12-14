const fs = require("fs");
const axios = require("axios");

module.exports = async (url, out, config = {}) => {
  const writer = fs.createWriteStream(out);
  const response = await axios.get(url, {
    ...config,
    responseType: "stream",
  });
  // ensure that the user can call `then()` only when the file has
  // been downloaded entirely.
  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on("error", (err) => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      if (!error) {
        resolve(true);
      }
      // no need to call the reject here, as it will have been called in the
      // 'error' stream;
    });
  });
};
