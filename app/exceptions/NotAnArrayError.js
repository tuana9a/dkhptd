const InvalidValueError = require("./InvalidValueError");

class NotAnArrayError extends InvalidValueError {
  constructor(value) {
    super("NOT_AN_ARRAY");
    this.withValue(value);
  }
}

module.exports = NotAnArrayError;
