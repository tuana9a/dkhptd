import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TermIdsJobV1sApi } from "src/apis/term-ids.dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "app-term-id-job-v1-table-page",
  templateUrl: "./term-id-job-v1-table-page.component.html",
  styleUrls: ["./term-id-job-v1-table-page.component.scss"]
})
export class TermIdJobV1TablePageComponent implements OnInit {
  @Input() termId = "";
  @Input() jobs?: DKHPTDJobV1[];
  constructor(private activatedRoute: ActivatedRoute, private api: TermIdsJobV1sApi) { }
  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const termId = params["termId"];
      this.termId = termId;
      this.api.getCurrentDecryptedJobs(termId).subscribe(res => {
        if (res.success) {
          if (this.termId == termId) {
            this.jobs = res.data;
          }
        }
      });
    });
  }
}
