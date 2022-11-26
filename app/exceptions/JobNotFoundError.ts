import { ObjectId } from "mongodb";
import BaseResponse from "../payloads/BaseResponse";
import SafeError from "./SafeError";

export default class JobNotFoundError extends SafeError {
  jobId: string | ObjectId;

  constructor(jobId: string | ObjectId) {
    super("JOB_NOT_FOUND");
    this.jobId = jobId;
  }

  toBaseResponse(): BaseResponse<unknown> {
    return new BaseResponse().failed(this.jobId).msg(this.message);
  }
}