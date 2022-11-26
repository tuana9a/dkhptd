import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class TypeMismatchError extends SafeError {
  value;
  type;
  path: string;

  constructor(name: string, value, type) {
    super("TYPE MISMATCH");
    this.path = name;
    this.value = value;
    this.type = type;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ path: this.path, value: this.value, type: this.type }).msg(this.message);
  }
}