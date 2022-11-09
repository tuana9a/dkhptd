import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidValueError extends SafeError {
  value;

  withValue(value) {
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.value).withMessage(this.message);
  }
}

