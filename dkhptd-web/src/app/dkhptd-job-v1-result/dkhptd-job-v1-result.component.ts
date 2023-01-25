import { Component, Input, OnInit } from "@angular/core";
import { DKHPTDResult } from "src/entities";

@Component({
  selector: "[app-dkhptd-job-v1-result]",
  templateUrl: "./dkhptd-job-v1-result.component.html",
  styleUrls: ["./dkhptd-job-v1-result.component.scss"]
})
export class DkhptdJobV1ResultComponent implements OnInit {
  @Input() result?: DKHPTDResult;

  ngOnInit(): void {
    //
  }
}
