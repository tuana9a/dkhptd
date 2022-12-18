import { Component, OnInit } from "@angular/core";
import { PublicApi } from "src/apis/public.api";
import { CookieUtils } from "src/utils/cookie.utils";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  username = "";
  password = "";
  message?: string;

  constructor(private publicApi: PublicApi, private cookieUtils: CookieUtils) { }

  ngOnInit(): void {
    //
  }

  login() {
    this.publicApi.login(this.username, this.password).subscribe((res) => {
      this.message = res.success ? "SUCCESS" : res.message;
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
