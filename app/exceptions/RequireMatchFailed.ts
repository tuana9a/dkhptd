import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class RequireMatchFailed extends SafeError {
  path: string;
  input;
  regex: RegExp;


  constructor(name: string, input, regex) {
    super("REQUIRE_MATCH_FAILED");
    this.path = name;
    this.input = input;
    this.regex = regex;
  }

  toBaseResponse() {
    return new BaseResponse().failed({ input: this.input, regex: this.regex }).msg(this.message);
  }
}