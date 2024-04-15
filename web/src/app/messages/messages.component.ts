import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "app-messages",
  templateUrl: "./messages.component.html",
  styleUrls: ["./messages.component.scss"]
})
export class MessagesComponent implements OnInit {

  constructor(public toast: ToastService) { }

  ngOnInit(): void {
    //
  }
}
