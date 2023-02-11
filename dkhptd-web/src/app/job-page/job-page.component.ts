import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import { DKHPTDResult } from "src/entities";
import { DKHPTDJobLogs } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";

@Component({
  selector: "app-job-page",
  templateUrl: "./job-page.component.html",
  styleUrls: ["./job-page.component.scss"]
})
export class JobPageComponent implements OnInit {
  @Input() id = "";
  @Input() job?: DKHPTDJobV1;
  @Input() logs?: DKHPTDJobLogs[] = [];
  @Input() results?: DKHPTDResult[] = [];
  @Input() showPassword = false;

  constructor(private route: ActivatedRoute, private dkhptdV1sApi: DKHPTDV1sApi) { }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.id = p["id"];
      this.dkhptdV1sApi.getCurrentDecryptJob(this.id).subscribe(res => {
        if (res.success) {
          this.job = res.data;
          this.getResults();
        }
      });
    });
  }

  getResults() {
    this.dkhptdV1sApi.getCurrentJobDecryptResults(this.id).subscribe(res => {
      if (res.success) {
        this.results = res.data;
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
