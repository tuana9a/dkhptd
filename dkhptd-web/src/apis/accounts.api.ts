import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Account, AccountPreference } from "src/entities";
import { BaseResponse, LoginResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class AccountsApi {
  constructor(private httpClient: HttpClient) {
  }

  current() {
    return this.httpClient.get<BaseResponse<Account>>("/api/accounts/current");
  }

  renewToken() {
    return this.httpClient.get<BaseResponse<LoginResponse>>("/api/accounts/current/renew-token");
  }

  changeCurrentPassword(newPassword: string) {
    return this.httpClient.put<BaseResponse<Account>>("/api/accounts/current/password", { password: newPassword });
  }

  currentPreferences() {
    return this.httpClient.get<BaseResponse<AccountPreference[]>>("/api/accounts/current/preferences");
  }

  currentPreferencesOfTermId(termId: string) {
    return this.httpClient.get<BaseResponse<AccountPreference[]>>(`/api/accounts/current/term-ids/${termId}/preferences`);
  }

  addPreference(preference: AccountPreference) {
    return this.httpClient.post<BaseResponse<unknown>>("/api/accounts/current/preference", preference);
  }

  changePreference(preferenceId: string, preference: AccountPreference) {
    return this.httpClient.put<BaseResponse<unknown>>(`/api/accounts/current/preferences/${preferenceId}`, preference);
  }

  deletePreference(preferenceId: string) {
    return this.httpClient.delete<BaseResponse<unknown>>(`/api/accounts/current/preferences/${preferenceId}`);
  }
}