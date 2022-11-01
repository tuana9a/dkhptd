const SafeError = require("./SafeError");

class MissingRequestBodyDataError extends SafeError {
  constructor() {
    super("MISSING_REQUEST_BODY_DATA");
  }
}

module.exports = MissingRequestBodyDataError;
