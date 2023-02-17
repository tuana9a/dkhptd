import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class TermIdsApi {
  constructor(private httpClient: HttpClient) {
  }

  all() {
    return this.httpClient.get<BaseResponse<string[]>>("/api/term-ids");
  }

  upsert(termIds: string[]) {
    return this.httpClient.post<BaseResponse<string[]>>("/api/term-ids", { data: termIds });
  }
}