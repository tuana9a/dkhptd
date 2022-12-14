import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Account from "src/entities/Account";
import AccountPreference from "src/entities/AccountPreference";
import BaseResponse from "src/payloads/BaseResponse";

@Injectable({
  providedIn: "root"
})
export class AccountsPreferenceApi {
  constructor(private httpClient: HttpClient) {
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