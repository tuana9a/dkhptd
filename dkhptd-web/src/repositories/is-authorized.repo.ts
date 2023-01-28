import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class AuthorizationRepo {
  public isAuthorized = false;

  ok() {
    this.isAuthorized = true;
  }

  unAuthorized() {
    this.isAuthorized = false;
  }
}