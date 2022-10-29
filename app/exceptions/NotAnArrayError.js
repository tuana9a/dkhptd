const InvalidValueError = require("./InvalidValueError");

class NotAndArrayError extends InvalidValueError {
  constructor(value) {
    super("NOT_AN_ARRAY");
    this.withValue(value);
  }
}

module.exports = NotAndArrayError;
