import { ObjectId } from "mongodb";
import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class AccountNotFoundError extends SafeError {
  accountId: string | ObjectId;

  constructor(accountId?: string | ObjectId) {
    super("ACCOUNT_NOT_FOUND");
    this.accountId = accountId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.accountId).withMessage(this.message);
  }
}