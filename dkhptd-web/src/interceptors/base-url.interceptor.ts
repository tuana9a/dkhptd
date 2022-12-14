import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(
    httpRequest: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    httpRequest = httpRequest.clone({
      url: environment.baseApiUrl + httpRequest.url,
    });
    return next.handle(httpRequest);
  }
}