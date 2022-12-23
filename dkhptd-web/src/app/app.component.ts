import { Component } from "@angular/core";
import { ToastMessagesRepo } from "src/repositories/toast-messages.repo";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "dkhptd-web";
  constructor(public toastMessagesRepo: ToastMessagesRepo) {
  }
}
