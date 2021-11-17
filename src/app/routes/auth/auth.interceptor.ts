import { Injectable } from '@angular/core';
import {HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {exhaustMap, take} from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap(user => {
        return next.handle(req.clone({
          headers: new HttpHeaders()
            .append('Authorization', 'Bearer ' + (user ? user.token : ''))
            // .append('Content-Type', 'application/x-www-form-urlencoded')
        }));
      }),
    );
  }
}
// Accept-Encoding: gzip, deflate
// Accept-Language: en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7
// Connection: keep-alive
// Host: dev.geneat.vn:8500
