import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AccountsApi } from "src/apis/accounts.api";
import { Session } from "src/repositories/is-authorized.repo";
import { ToastService } from "src/repositories/toast-messages.repo";
import { CookieUtils } from "src/utils/cookie.utils";
import ms from "ms";
import { SettingsRepo } from "src/repositories/settings.repo";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, OnDestroy {
  title = "dkhptd-web";
  intervalHandler: any;
  constructor(
    public toast: ToastService,
    public cookieUtils: CookieUtils,
    public session: Session,
    public accountsApi: AccountsApi,
    public router: Router,
    private settings: SettingsRepo,
  ) { }
  ngOnInit(): void {
    this.accountsApi.current().subscribe(res => {
      if (res.success) {
        this.session.authenticated(res.data);
      }
    });
    this.intervalHandler = setInterval(() => {
      this.accountsApi.renewToken().subscribe(res => {
        if (res.data) {
          this.cookieUtils.set("jwt", res.data.token);
          this.session.authenticated(res.data);
        }
      });
    }, ms(this.settings.renewTokenEvery));
  }
  ngOnDestroy(): void {
    clearInterval(this.intervalHandler);
  }
  showAnyway() {
    return true;
  }
  showIfAuthorized() {
    return this.session.isAuthorized;
  }
  showIfUnauthorized() {
    return !this.session.isAuthorized;
  }
  showIfAdmin() {
    return this.session.isAdmin();
  }
  onLogout() {
    this.cookieUtils.delete("jwt");
    this.session.unAuthorized();
    this.router.navigate(["/login"]);
  }
  currentUsername() {
    return this.session.currentAccount?.username;
  }
}
