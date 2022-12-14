import BaseResponse from "../payloads/BaseResponse";

export default class SafeError extends Error {
  private code: number;

  __isSafeError: boolean;

  constructor(message: string) {
    super(message);
    this.__isSafeError = true;
  }

  codee(code: number) {
    this.code = code;
  }

  toBaseResponse() {
    return new BaseResponse().failed().msg(this.message).codee(this.code);
  }
}

