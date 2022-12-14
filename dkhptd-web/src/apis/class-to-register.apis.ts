import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import ClassToRegister from "src/entities/ClassToRegister";
import BaseResponse from "src/payloads/BaseResponse";

@Injectable({
  providedIn: "root"
})
export class ClassToRegsitersApi {
  constructor(private httpClient: HttpClient) {
  }

  find(q: string, page: number, size: number) {
    return this.httpClient.get<BaseResponse<ClassToRegister[]>>("/api/class-to-registers", {
      params: {
        q: q,
        page: page,
        size: size,
      }
    });
  }
  searchByClassIds() {
    return this.httpClient.get<BaseResponse<ClassToRegister[]>>("/api/class-to-registers/class-ids");
  }
}