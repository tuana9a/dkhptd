import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class IsAuthorizedRepo {
  public isAuthorized = false;

  authorized() {
    this.isAuthorized = true;
  }

  unAuthorized() {
    this.isAuthorized = false;
  }
}