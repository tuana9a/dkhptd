import { Injectable } from "@angular/core";
import Account from "src/entities/Account";
import AccountPreference from "src/entities/AccountPreference";

@Injectable({
  providedIn: "root"
})
export class CurrentUserRepo {
  account?: Account;
  preferences: AccountPreference[] = [];

  setAccount(account: Account) {
    this.account = account;
  }

  setPreferences(preferences: AccountPreference[]) {
    this.preferences = preferences;
  }
}