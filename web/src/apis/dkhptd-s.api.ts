import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DKHPTDJob } from "src/entities";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class DKHPTDsApi {
  constructor(private httpClient: HttpClient) {
  }

  getCurrentJobs() {
    return this.httpClient.get<BaseResponse<DKHPTDJob[]>>("/api/accounts/current/dkhptd-s");
  }
}