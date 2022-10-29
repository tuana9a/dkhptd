const InvalidValueError = require("./InvalidValueError");

class InvalidHocKyError extends InvalidValueError {
  constructor(value) {
    super("INVALID_HOC_KY");
    this.withValue(value);
  }
}

module.exports = InvalidHocKyError;
