import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DKHPTDResult } from "src/entities";
import { DKHPTDJobLogs } from "src/entities";
import { DKHPTDJobV1 } from "src/entities";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class DKHPTDV1sApi {
  constructor(private httpClient: HttpClient) {
  }

  getCurrentJobs() {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1[]>>("/api/accounts/current/v1/dkhptd-s");
  }

  getCurrentDecryptedJobs() {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1[]>>("/api/accounts/current/v1/d/dkhptd-s");
  }

  getCurrentDecryptJob(jobId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobV1>>(`/api/accounts/current/v1/d/dkhptd-s/${jobId}`);
  }

  getCurrentJobDecryptLogs(jobId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDJobLogs[]>>(`/api/accounts/current/v1/dkhptd-s/${jobId}/d/logs`);
  }

  getCurrentJobDecryptResults(jobId: string) {
    return this.httpClient.get<BaseResponse<DKHPTDResult[]>>(`/api/accounts/current/v1/dkhptd-s/${jobId}/d/results`);
  }

  submitCurrentNewJobV1(username: string, password: string, classIds: string[], timeToStart: number) {
    return this.httpClient.post<BaseResponse<unknown>>("/api/accounts/current/v1/dkhptd", {
      username,
      password,
      classIds,
      timeToStart,
    });
  }

  cancelJob(jobId?: string) {
    return this.httpClient.put<BaseResponse<string>>(`/api/accounts/current/v1/dkhptd-s/${jobId}/cancel`, {});
  }

  retryJob(jobId?: string) {
    return this.httpClient.post<BaseResponse<string>>(`/api/accounts/current/v1/dkhptd-s/${jobId}/retry`, {});
  }
}