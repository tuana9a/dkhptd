import { Component, OnInit } from "@angular/core";
import { DKHPTDV1sApi } from "src/apis/dkhptd-v1-s.api";
import DKHPTDJobV1 from "src/entities/DKHPTDJobV1";

@Component({
  selector: "app-manage-dkhptd-job-v1",
  templateUrl: "./manage-dkhptd-job-v1.component.html",
  styleUrls: ["./manage-dkhptd-job-v1.component.scss"]
})
export class ManageDKHPTDJOBV1Component implements OnInit {
  keys: Set<string> = new Set();
  jobs?: DKHPTDJobV1[] = [];

  constructor(private dkhptdV1sApi: DKHPTDV1sApi) {
  }

  ngOnInit(): void {
    this.dkhptdV1sApi.getCurrentDecryptedJobs().subscribe(res => {
      this.jobs = res.data;
    });
  }
}
