import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Account from "src/entities/Account";
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
}