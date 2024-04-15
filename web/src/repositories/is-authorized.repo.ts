import { Injectable } from "@angular/core";
import { Account, Role } from "src/entities";

@Injectable({
  providedIn: "root"
})
export class Session {
  isAuthorized = false;
  currentAccount?: Account;

  isAdmin() {
    return (String(this.currentAccount?.role).toUpperCase() == Role.ADMIN);
  }

  authenticated(account?: Account) {
    this.isAuthorized = true;
    this.currentAccount = account;
  }

  unAuthorized() {
    this.isAuthorized = false;
    this.currentAccount = undefined;
  }
}