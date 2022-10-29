class InvalidValueError extends Error {
  constructor(message) {
    super(message);
    this.__isInvalidValueError = true;
  }

  withValue(value) {
    this.value = value;
  }
}
module.exports = InvalidValueError;
