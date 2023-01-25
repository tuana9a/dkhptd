import { Injectable } from "@angular/core";
import { Account } from "src/entities";
import { AccountPreference } from "src/entities";

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