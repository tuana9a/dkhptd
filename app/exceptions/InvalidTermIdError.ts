import InvalidValueError from "./InvalidValueError";

export default class InvalidTermIdError extends InvalidValueError {
  constructor(value: any) {
    super("INVALID_HOC_KY");
    this.withValue(value);
  }
}
