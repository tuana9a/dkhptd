import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidValueError extends SafeError {
  value;

  constructor(value) {
    super("INVALID_VALUE");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}

