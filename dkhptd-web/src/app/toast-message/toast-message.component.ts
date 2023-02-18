import { Component, OnInit } from "@angular/core";
import { ToastService } from "src/repositories/toast-messages.repo";

@Component({
  selector: "[app-toast-message]",
  templateUrl: "./toast-message.component.html",
  styleUrls: ["./toast-message.component.scss"]
})
export class ToastMessageComponent implements OnInit {
  constructor(private toastMessagesRepo: ToastService) { }

  ngOnInit(): void {
    //
  }

  messages() {
    return this.toastMessagesRepo.messages;
  }

  visible() {
    return this.toastMessagesRepo.visibleMessages;
  }
}
