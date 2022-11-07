import InvalidValueError from "./InvalidValueError";

export default class NotAnArrayError extends InvalidValueError {
  constructor(value) {
    super("NOT_AN_ARRAY");
    this.withValue(value);
  }
}
