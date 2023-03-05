import { Injectable } from "@angular/core";
import moment from "moment";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class ToastService {
  visibleMessages: (string | undefined)[] = [];
  messages: (string | undefined)[] = [];

  constructor() {
    //
  }

  __append(message: string | undefined) {
    this.messages.unshift(message);
  }

  push(message: string | undefined) {
    this.__append(message);
    this.visibleMessages.push(`${moment().format("HH:mm:ss")} ${message}`);
    setTimeout(() => this.visibleMessages.shift(), 2000);
  }

  handleResponse(res: BaseResponse<any>) {
    if (res.success) {
      this.push("Thành Công");
    }
  }
}