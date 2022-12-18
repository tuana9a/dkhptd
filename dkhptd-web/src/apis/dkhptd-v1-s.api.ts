import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import DKHPTDJobLogs from "src/entities/DKHPTDJobLogs";
import DKHPTDJobV1 from "src/entities/DKHPTDJobV1";
import BaseResponse from "src/payloads/BaseResponse";

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