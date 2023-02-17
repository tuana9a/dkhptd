import { Component, Input, OnInit } from "@angular/core";
import { DKHPTDJob, DKHPTDJobResult } from "src/entities";

@Component({
  selector: "[app-job-v1-result]",
  templateUrl: "./job-v1-result.component.html",
  styleUrls: ["./job-v1-result.component.scss"]
})
export class JobV1ResultComponent implements OnInit {
  @Input() result?: DKHPTDJobResult;
  @Input() job?: DKHPTDJob;

  ngOnInit(): void {
    //
  }
}
