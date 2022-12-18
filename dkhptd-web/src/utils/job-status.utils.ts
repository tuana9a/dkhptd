import { Injectable } from "@angular/core";
import JobStatus from "src/configs/JobStatus";

@Injectable({
  providedIn: "root",
})
export class JobStatusUtils {
  isCancelable(status?: number) {
    return ([JobStatus.READY] as (number | undefined)[]).includes(status);
  }

  isRetryable(status?: number) {
    return ([JobStatus.DONE, JobStatus.CANCELED] as (number | undefined)[]).includes(status);
  }
}