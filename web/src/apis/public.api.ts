import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Account } from "src/entities";
import { BaseResponse, LoginResponse } from "src/payloads";

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