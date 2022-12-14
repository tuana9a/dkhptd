import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import DKHPTDJobLogs from "src/entities/DKHPTDJobLogs";
import DKHPTDJobV1 from "src/entities/DKHPTDJobV1";

@Component({
  selector: "app-dkhptd-job",
  templateUrl: "./dkhptd-job.component.html",
  styleUrls: ["./dkhptd-job.component.scss"]
})
export class DkhptdJobComponent implements OnInit {
  id = "";
  job?: DKHPTDJobV1;
  logs?: DKHPTDJobLogs[];
  constructor(private route: ActivatedRoute, private dkhptdV1sApi: DKHPTDV1sApi) { }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.id = p["id"];
      this.dkhptdV1sApi.getCurrentDecryptJob(this.id).subscribe(res => {
        if (res.success) {
          this.job = res.data;
          this.showLogs();
        }
      });
    });
  }

  showLogs() {
    this.dkhptdV1sApi.getCurrentJobDecryptLogs(this.id).subscribe(res => {
      this.logs = res.data;
    });
  }
}
