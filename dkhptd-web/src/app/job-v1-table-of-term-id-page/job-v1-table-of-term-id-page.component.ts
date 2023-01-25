import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TermIdsJobV1sApi } from "src/apis/term-ids.dkhptd-v1-s.api";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "app-job-v1-table-of-term-id-page",
  templateUrl: "./job-v1-table-of-term-id-page.component.html",
  styleUrls: ["./job-v1-table-of-term-id-page.component.scss"]
})
export class JobV1TableOfTermIdPageComponent implements OnInit {
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
