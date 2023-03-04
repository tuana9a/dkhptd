import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "src/entities";
import { BaseResponse } from "src/payloads";

@Injectable({
  providedIn: "root"
})
export class SubjectsApi {
  constructor(private httpClient: HttpClient) {
  }

  find(q: string, page: number, size: number) {
    return this.httpClient.get<BaseResponse<Subject[]>>("/api/subjects", {
      params: {
        q: q,
        page: page,
        size: size,
      }
    });
  }

  findBySubjectId(subjectId: string) {
    return this.httpClient.get<BaseResponse<Subject>>(`/api/subjects/subject-ids/${subjectId}`);
  }
}