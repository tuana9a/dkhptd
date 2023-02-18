import { Injectable } from "@angular/core";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class ToastService {
  i = 0;
  visibleMessages: (string | undefined)[] = [];
  messages: (string | undefined)[] = [];

  constructor() {
    //
  }

  __append(message: string | undefined) {
    this.messages.unshift(message);
  }

  push(message: string | undefined) {
    this.i += 1;
    this.__append(message);
    this.visibleMessages.push(`${this.i} ${message}`);
    setTimeout(() => this.visibleMessages.shift(), 2000);
  }

  handleResponse(res: BaseResponse<any>) {
    if (res.success) {
      this.push("Thành Công");
    }
  }
}