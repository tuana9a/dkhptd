import InvalidValueError from "./InvalidValueError";

export default class InvalidCttSisUsernameError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CTT_SIS_USERNAME");
    this.withValue(value);
  }
}
