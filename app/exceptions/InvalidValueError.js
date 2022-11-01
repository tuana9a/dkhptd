const BaseResponse = require("../payloads/BaseResponse");
const SafeError = require("./SafeError");

class InvalidValueError extends SafeError {
  withValue(value) {
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.value).withMessage(this.message);
  }
}
module.exports = InvalidValueError;
