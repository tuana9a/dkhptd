import BaseResponse from "../payloads/BaseResponse";

export default class SafeError extends Error {
  __isSafeError: boolean;

  constructor(message: string) {
    super(message);
    this.__isSafeError = true;
  }

  toBaseResponse() {
    return new BaseResponse().failed().withMessage(this.message);
  }
}

