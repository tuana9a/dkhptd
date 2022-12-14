import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class InvalidClassIdsError extends SafeError {
  value;

  constructor(value) {
    super("INVALID_CLASS_IDS");
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}
