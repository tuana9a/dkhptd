import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ToastMessagesRepo {
  visibleMessages: { i: number; m: (string | undefined) }[] = [];
  messages: (string | undefined)[] = [];

  constructor() {
    //
  }

  add(message: string | undefined) {
    this.messages.unshift(message);
  }

  push(message: string | undefined) {
    this.add(message);
    this.visibleMessages.push({ i: this.messages.length, m: message });
    setTimeout(() => this.visibleMessages.shift(), 2000);
  }
}