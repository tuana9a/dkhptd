import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class SettingsApi {
  constructor(private httpClient: HttpClient) {
  }

  getRenewTokenEvery() {
    return this.httpClient.get<BaseResponse<string>>("/api/settings/renew-token-every");
  }

  getFreshJobEvery() {
    return this.httpClient.get<BaseResponse<string>>("/api/settings/refresh-job-every");
  }
}