import { Component, OnInit } from "@angular/core";
import { AccountsApi } from "src/apis/accounts.api";
import { IsAuthorizedRepo } from "src/repositories/is-authorized.repo";
import { ToastMessagesRepo } from "src/repositories/toast-messages.repo";
import { CookieUtils } from "src/utils/cookie.utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "dkhptd-web";
  constructor(public toastMessagesRepo: ToastMessagesRepo, public cookieUtils: CookieUtils, public isAuthorizedRepo: IsAuthorizedRepo, public accountsApi: AccountsApi) {
  }
  ngOnInit(): void {
    this.accountsApi.current().subscribe(res => {
      if (res.success) {
        this.isAuthorizedRepo.authorized();
      }
    });
  }
  showLogin() {
    return !this.isAuthorizedRepo.isAuthorized;
  }
  showRegister() {
    return !this.isAuthorizedRepo.isAuthorized;
  }
  showMessages() {
    return true;
  }
  showUploadTKBXlsx() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  showPrefereces() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  showSearchClassToRegister() {
    return true;
  }
  showNewJobV1() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  showManageJobs() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  showProfile() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  showLogout() {
    return this.isAuthorizedRepo.isAuthorized;
  }
  onLogout() {
    this.cookieUtils.set({ name: "jwt", value: "" });
    this.isAuthorizedRepo.unAuthorized();
  }
}
