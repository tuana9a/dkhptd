const InvalidValueError = require("./InvalidValueError");

class InvalidCttSisUsernameError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CTT_SIS_USERNAME");
    this.withValue(value);
  }
}

module.exports = InvalidCttSisUsernameError;
