import InvalidValueError from "./InvalidValueError";

export default class InvalidClassIdsError extends InvalidValueError {
  constructor(value) {
    super("INVALID_CLASS_IDS");
    this.withValue(value);
  }
}
