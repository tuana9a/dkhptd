import { Component, Input, OnInit } from "@angular/core";
import { ActionLog } from "src/entities";

@Component({
  selector: "[app-dkhptd-job-logs]",
  templateUrl: "./dkhptd-job-logs.component.html",
  styleUrls: ["./dkhptd-job-logs.component.scss"]
})
export class DkhptdJobLogsComponent implements OnInit {
  @Input() id = "";
  @Input() logs?: ActionLog[] = [];

  ngOnInit(): void {
    //
  }
}
