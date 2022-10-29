const InvalidValueError = require("./InvalidValueError");

class InvalidCttSisPassswordError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CTT_SIS_PASSWORD");
    this.withValue(value);
  }
}

module.exports = InvalidCttSisPassswordError;
