import { Component, Input, OnInit } from "@angular/core";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDJobLogs } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";
import { JobStatusUtils } from "src/utils/job-status.utils";

@Component({
  selector: "[app-dkhptd-job-row]",
  templateUrl: "./dkhptd-job-row.component.html",
  styleUrls: ["./dkhptd-job-row.component.scss"]
})
export class DkhptdJobRowComponent implements OnInit {
  id = "";
  @Input() job?: DKHPTDJobV1;
  logs?: DKHPTDJobLogs[];
  @Input() showPassword = false;
  @Input() showTermId = false;
  @Input() showId = true;

  constructor(private api: DKHPTDV1sApi, private jobStatusUtils: JobStatusUtils) {
  }

  ngOnInit(): void {
    //
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  isCancelable() {
    return this.jobStatusUtils.isCancelable(this.job?.status);
  }

  isRetryable() {
    return this.jobStatusUtils.isRetryable(this.job?.status);
  }

  onCancelJob() {
    this.api.cancelJob(this.job?._id).subscribe();
  }

  onRetryJob() {
    this.api.retryJob(this.job?._id).subscribe();
  }
}
