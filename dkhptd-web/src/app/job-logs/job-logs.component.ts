import { Component, Input, OnInit } from "@angular/core";
import { ActionLog } from "src/entities";

@Component({
  selector: "[app-job-logs]",
  templateUrl: "./job-logs.component.html",
  styleUrls: ["./job-logs.component.scss"]
})
export class JobLogsComponent implements OnInit {
  @Input() id = "";
  @Input() logs?: ActionLog[] = [];

  ngOnInit(): void {
    //
  }
}
