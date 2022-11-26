import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class UsernameExistedError extends SafeError {
  username: string;

  constructor(username: string) {
    super("USERNAME_EXISTED");
    this.username = username;
  }

  toBaseResponse() {
    return new BaseResponse().failed(this.username).msg(this.message);
  }
}
