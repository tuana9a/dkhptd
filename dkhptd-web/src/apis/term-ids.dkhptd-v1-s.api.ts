import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DKHPTDJobResult } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class TermIdsJobV1sApi {
  constructor(private httpClient: HttpClient) {
  }

  getCurrentJobs(termId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1[]>>(`/api/accounts/current/term-ids/${termId}/v1/dkhptd-s`);
  }

  getCurrentDecryptedJobs(termId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1[]>>(`/api/accounts/current/term-ids/${termId}/v1/d/dkhptd-s`);
  }

  getCurrentDecryptJob(termId: string, jobId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1>>(`/api/accounts/current/term-ids/${termId}/v1/d/dkhptd-s/${jobId}`);
  }

  getCurrentJobDecryptResults(termId: string, jobId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobResult[]>>(`/api/accounts/current/term-ids/${termId}/v1/dkhptd-s/${jobId}/d/results`);
  }

  submitCurrentNewJobV1(termId: string, username: string, password: string, classIds: string[], timeToStart: number) {
    return this.httpClient.post<BaseResponse<unknown>>("/api/accounts/current/v1/dkhptd", {
      username,
      password,
      classIds,
      timeToStart,
      termId,
    });
  }

  termIdSubmitCurrentNewJobV1(termId: string, username: string, password: string, classIds: string[], timeToStart: number) {
    return this.httpClient.post<BaseResponse<unknown>>(`/api/accounts/current/term-ids/${termId}/v1/dkhptd`, {
      username,
      password,
      classIds,
      timeToStart,
      termId,
    });
  }

  cancelJob(termId: string, jobId?: string) {
    return this.httpClient.put<BaseResponse<string>>(`/api/accounts/current/term-ids/${termId}/v1/dkhptd-s/${jobId}/cancel`, {});
  }

  retryJob(termId: string, jobId?: string) {
    return this.httpClient.post<BaseResponse<string>>(`/api/accounts/current/term-ids/${termId}/v1/dkhptd-s/${jobId}/retry`, {});
  }
}