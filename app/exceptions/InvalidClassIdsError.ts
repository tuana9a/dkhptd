import InvalidValueError from "./InvalidValueError";

export default class InvalidClassIdsError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CTT_SIS_USERNAME");
    this.withValue(value);
  }
}
