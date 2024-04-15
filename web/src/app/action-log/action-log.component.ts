import { Component, Input, OnInit } from "@angular/core";
import { ActionLog } from "src/entities";

@Component({
  selector: "[app-action-log]",
  templateUrl: "./action-log.component.html",
  styleUrls: ["./action-log.component.scss"]
})
export class ActionLogComponent implements OnInit {
  @Input() showOutput = false;
  @Input() actionLog?: ActionLog;
  ngOnInit(): void {
    //
  }

  toggleShowOutput() {
    this.showOutput = !this.showOutput;
  }
}
