import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidCttSisPassswordError extends SafeError {
  value;

  constructor(value) {
    super("INVALID_CTT_SIS_PASSWORD");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}
