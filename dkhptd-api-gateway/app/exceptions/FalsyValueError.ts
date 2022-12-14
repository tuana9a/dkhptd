import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class FaslyValueError extends SafeError {
  value;
  path: string;

  constructor(name: string, value) {
    super("FALSY_VALUE");
    this.path = name;
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}