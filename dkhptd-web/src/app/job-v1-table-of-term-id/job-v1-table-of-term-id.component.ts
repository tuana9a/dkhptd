import { Component, Input, OnInit } from "@angular/core";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { TermIdsJobV1sApi } from "src/apis/term-ids.dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "[app-job-v1-table-of-term-id]",
  templateUrl: "./job-v1-table-of-term-id.component.html",
  styleUrls: ["./job-v1-table-of-term-id.component.scss"]
})
export class JobV1TableOfTermIdComponent implements OnInit {
  keys: Set<string> = new Set();
  @Input() termId = "";
  @Input() jobs?: DKHPTDJobV1[] = [];
  @Input() showPassword = false;
  faEye = faEye;

  constructor(private api: TermIdsJobV1sApi) {
  }

  ngOnInit(): void {
    //
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
