import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Account from "src/entities/Account";
import BaseResponse from "src/payloads/BaseResponse";
import LoginResponse from "src/payloads/LoginResponse";

@Injectable({
  providedIn: "root"
})
export class PublicApi {
  constructor(private httpClient: HttpClient) {
  }

  login(username: string, password: string) {
    return this.httpClient.post<BaseResponse<LoginResponse>>("/api/login", { username, password });
  }

  signup(username: string, password: string) {
    return this.httpClient.post<BaseResponse<Account>>("/api/signup", { username, password });
  }
}