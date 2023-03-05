import { Component, Input, OnInit } from "@angular/core";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "app-manage-job-v1",
  templateUrl: "./manage-job-v1.component.html",
  styleUrls: ["./manage-job-v1.component.scss"]
})
export class ManageJobV1Component implements OnInit {
  keys: Set<string> = new Set();
  jobs?: DKHPTDJobV1[] = [];
  showPassword = false;
  @Input() showTimeToStart = false;
  @Input() showId = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(private dkhptdV1sApi: DKHPTDV1sApi) {
  }

  ngOnInit(): void {
    this.dkhptdV1sApi.getCurrentDecryptedJobs().subscribe(res => {
      this.jobs = res.data;
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
