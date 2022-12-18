import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ToastMessagesRepo {
  messages: string[] = [];

  add(message: string) {
    this.messages.unshift(message);
  }
}