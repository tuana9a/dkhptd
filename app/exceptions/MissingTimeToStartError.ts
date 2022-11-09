import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class MissingTimeToStartError extends SafeError {
  constructor() {
    super("MISSING_TIME_TO_START");
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed().withMessage(this.message);
  }
}