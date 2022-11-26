import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class RequireLengthFailed extends SafeError {
  path: string;
  input;
  comparator;

  constructor(name: string, input, comparator) {
    super("REQUIRE_LENGTH_FAILED");
    this.path = name;
    this.input = input;
    this.comparator = comparator;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ input: this.input, comparator: this.comparator }).msg(this.message);
  }
}