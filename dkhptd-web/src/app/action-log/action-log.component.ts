import { Component, Input, OnInit } from "@angular/core";
import ActionLog from "src/entities/ActionLog";

@Component({
  selector: "[app-action-log]",
  templateUrl: "./action-log.component.html",
  styleUrls: ["./action-log.component.scss"]
})
export class ActionLogComponent implements OnInit {
  @Input() actionLog?: ActionLog;
  ngOnInit(): void {
    //
  }
}
