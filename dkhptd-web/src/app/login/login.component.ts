import { Component } from "@angular/core";
import { PublicApi } from "src/apis/public.api";
import { ToastMessagesRepo } from "src/repositories/toast-messages.repo";
import { CookieUtils } from "src/utils/cookie.utils";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent {
  username = "";
  password = "";
  message?: string;

  constructor(private publicApi: PublicApi, private cookieUtils: CookieUtils, private toastMessagesRepo: ToastMessagesRepo) { }

  login() {
    this.publicApi.login(this.username, this.password).subscribe((res) => {
      this.message = res.success ? "Thành Công" : res.message;
      this.toastMessagesRepo.add(this.message);
      if (res.success) {
        this.cookieUtils.set({ name: "jwt", value: res.data?.token });
      }
    });
  }

  onKeyPress(e: KeyboardEvent) {
    if (e.key == "Enter") {
      this.login();
    }
  }
}
