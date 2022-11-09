import InvalidValueError from "./InvalidValueError";

export default class InvalidCttSisPassswordError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CTT_SIS_PASSWORD");
    this.withValue(value);
  }
}
