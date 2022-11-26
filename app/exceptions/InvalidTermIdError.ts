import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidTermIdError extends SafeError {
  value;

  constructor(value) {
    super("INVALID_HOC_KY");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}
