import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";
import { ToastService } from "src/repositories/toast-messages.repo";
import { JobStatusUtils } from "src/utils/job-status.utils";

@Component({
  selector: "[app-job-row]",
  templateUrl: "./job-row.component.html",
  styleUrls: ["./job-row.component.scss"]
})
export class JobRowComponent implements OnInit, OnDestroy {
  id = "";
  @Input() job?: DKHPTDJobV1;
  @Input() showPassword = false;
  @Input() showTermId = false;
  @Input() showId = true;
  @Input() intervalUpdate = false;
  @Input() showTimeToStart = false;
  faEye = faEye;
  stopInterval: any;
  faEyeSlash = faEyeSlash;

  constructor(private api: DKHPTDV1sApi, private jobStatusUtils: JobStatusUtils, private toast: ToastService) {
  }

  ngOnInit(): void {
    if (this.intervalUpdate && this.job && this.job._id) {
      this.stopInterval = setInterval(() => {
        this.api.getCurrentDecryptJob(this.job?._id as string).subscribe(res => {
          this.job = res.data;
        });
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.stopInterval);
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
    this.api.cancelJob(this.job?._id).subscribe(res => this.toast.handleResponse(res));
  }

  onRetryJob() {
    this.api.retryJob(this.job?._id).subscribe(res => this.toast.handleResponse(res));
  }
}
