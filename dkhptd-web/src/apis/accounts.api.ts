import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Account from "src/entities/Account";
import AccountPreference from "src/entities/AccountPreference";
import BaseResponse from "src/payloads/BaseResponse";

@Injectable({
  providedIn: "root"
})
export class AccountsApi {
  constructor(private httpClient: HttpClient) {
  }

  current() {
    return this.httpClient.get<BaseResponse<Account>>("/api/accounts/current");
  }

  changeCurrentPassword(newPassword: string) {
    return this.httpClient.put<BaseResponse<Account>>("/api/accounts/current/password", { password: newPassword });
  }

  currentPreferences() {
    return this.httpClient.get<BaseResponse<AccountPreference[]>>("/api/accounts/current/preferences");
  }

  addPreference(preference: AccountPreference) {
    return this.httpClient.post<BaseResponse<unknown>>("/api/accounts/current/preference", preference);
  }

  changePreference(preferenceId: string, preference: AccountPreference) {
    return this.httpClient.put<BaseResponse<unknown>>(`/api/accounts/current/preferences/${preferenceId}`, preference);
  }
}