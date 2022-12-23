import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ToastMessagesRepo {
  messages: (string | undefined)[] = [];

  add(message: string | undefined) {
    this.messages.unshift(message);
  }
}