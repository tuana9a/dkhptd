import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class NotAnArrayError extends SafeError {
  path: string;
  value;

  constructor(name: string, value) {
    super("NOT_AN_ARRAY");
    this.path = name;
    this.value = value;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ message: this.message, value: this.value }).msg(this.message);
  }
}
