import { ObjectId } from "mongodb";
import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class WrongPasswordError extends SafeError {
  accountId: string | ObjectId;

  constructor(accountId?: string | ObjectId) {
    super("WRONG_PASSWORD");
    this.accountId = accountId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.accountId).msg(this.message);
  }
}