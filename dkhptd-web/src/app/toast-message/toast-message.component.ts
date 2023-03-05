import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "[app-toast-message]",
  templateUrl: "./toast-message.component.html",
  styleUrls: ["./toast-message.component.scss"]
})
export class ToastMessageComponent implements OnInit {
  constructor(private toast: ToastService) { }

  ngOnInit(): void {
    //
  }

  messages() {
    return this.toast.messages;
  }

  visible() {
    return this.toast.visibleMessages;
  }
}
