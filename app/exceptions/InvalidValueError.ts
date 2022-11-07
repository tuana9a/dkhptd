import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidValueError extends SafeError {
  value: any;

  withValue(value: any) {
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.value).withMessage(this.message);
  }
}

