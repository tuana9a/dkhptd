const BaseResponse = require("../payloads/BaseResponse");

class SafeError extends Error {
  constructor(message) {
    super(message);
    this.__isSafeError = true;
  }

  toBaseResponse() {
    return new BaseResponse().failed().withMessage(this.message);
  }
}

module.exports = SafeError;
