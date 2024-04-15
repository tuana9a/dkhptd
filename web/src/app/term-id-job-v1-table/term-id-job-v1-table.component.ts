import { Component, Input, OnInit } from "@angular/core";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { TermIdsJobV1sApi } from "src/apis/term-ids.dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "[app-term-id-job-v1-table]",
  templateUrl: "./term-id-job-v1-table.component.html",
  styleUrls: ["./term-id-job-v1-table.component.scss"]
})
export class TermIdJobV1TableComponent implements OnInit {
  keys: Set<string> = new Set();
  @Input() termId = "";
  @Input() jobs?: DKHPTDJobV1[] = [];
  @Input() showPassword = false;
  @Input() showTimeToStart = false;
  @Input() showId = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  constructor(private api: TermIdsJobV1sApi) {
  }

  ngOnInit(): void {
    //
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
