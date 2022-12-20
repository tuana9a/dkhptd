import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CookieUtils } from "../utils/cookie.utils";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private cookieUtils: CookieUtils) { }
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.cookieUtils.get("jwt");
    if (!request.headers.get("authorization") && !request.headers.get("Authorization")) {
      request = request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
    return next.handle(request);
  }
}
