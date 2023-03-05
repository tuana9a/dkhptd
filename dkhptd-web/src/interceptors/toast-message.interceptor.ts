import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from "@angular/common/http";

import { map } from "rxjs/operators";
import { BaseResponse } from "src/payloads";
import { ToastService } from "src/repositories/toast-messages.repo";

@Injectable()
export class ToastMessageInterceptor implements HttpInterceptor {
  constructor(private toast: ToastService) {

  }
  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(request).pipe(
      map((event: HttpEvent<BaseResponse<any>>) => {
        if (event instanceof HttpResponse) {
          const body = event.body;
          if (!body?.success) {
            this.toast.push(`Thất bại: ${body?.message}`);
          }
          event = event.clone({ body: body });
        }
        return event;
      })
    );
  }
}
