import { Pipe, PipeTransform } from "@angular/core";

const JobStatus = new Map<number, string>();

JobStatus.set(0, "READY");
JobStatus.set(1, "DOING");
JobStatus.set(20, "CANCELED");
JobStatus.set(21, "DONE");
JobStatus.set(2, "FAILED");

@Pipe({ name: "JobStatus" })
export class JobStatusPipe implements PipeTransform {
  transform(value?: number): string | undefined {
    return JobStatus.get(value as number);
  }
}