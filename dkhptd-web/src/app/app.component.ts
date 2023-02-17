import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AccountsApi } from "src/apis/accounts.api";
import { Session } from "src/repositories/is-authorized.repo";
import { ToastMessagesRepo } from "src/repositories/toast-messages.repo";
import { CookieUtils } from "src/utils/cookie.utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "dkhptd-web";
  constructor(
    public toastMessagesRepo: ToastMessagesRepo,
    public cookieUtils: CookieUtils,
    public session: Session,
    public accountsApi: AccountsApi,
    public router: Router,
  ) { }
  ngOnInit(): void {
    this.accountsApi.current().subscribe(res => {
      if (res.success) {
        this.session.authenticated(res.data);
      }
    });
  }
  showLogin() {
    return !this.session.isAuthorized;
  }
  showRegister() {
    return !this.session.isAuthorized;
  }
  showMessages() {
    return true;
  }
  showUploadTKB() {
    return this.session.isAdmin();
  }
  showManageTermId() {
    return this.session.isAdmin();
  }
  showPrefereces() {
    return this.session.isAuthorized;
  }
  showSearchClassToRegister() {
    return true;
  }
  showNewJobV1() {
    return this.session.isAuthorized;
  }
  showManageJobs() {
    return this.session.isAuthorized;
  }
  showManageJobByTermIds() {
    return this.session.isAuthorized;
  }
  showProfile() {
    return this.session.isAuthorized;
  }
  showLogout() {
    return this.session.isAuthorized;
  }
  onLogout() {
    this.cookieUtils.set({ name: "jwt", value: "" });
    this.session.unAuthorized();
    this.router.navigate(["/login"]);
  }
  currentUsername() {
    return this.session.currentAccount?.username;
  }
}
