import { Component, Input, OnInit } from "@angular/core";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDResult } from "src/entities";
import { DKHPTDJobLogs } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "[app-dkhptd-job]",
  templateUrl: "./dkhptd-job.component.html",
  styleUrls: ["./dkhptd-job.component.scss"]
})
export class DkhptdJobComponent implements OnInit {
  @Input() id = "";
  @Input() job?: DKHPTDJobV1;
  @Input() logs?: DKHPTDJobLogs[];
  @Input() results?: DKHPTDResult[] = [];
  @Input() showPassword = false;
  faEye = faEye;

  constructor(private dkhptdV1sApi: DKHPTDV1sApi) { }

  ngOnInit(): void {
    // do nothing
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
