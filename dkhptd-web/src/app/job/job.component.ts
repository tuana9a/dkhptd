import { Component, Input, OnInit } from "@angular/core";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDJobResult } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "[app-job]",
  templateUrl: "./job.component.html",
  styleUrls: ["./job.component.scss"]
})
export class JobComponent implements OnInit {
  @Input() id = "";
  @Input() job?: DKHPTDJobV1;
  @Input() results?: DKHPTDJobResult[] = [];
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
