import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

import {NzMessageService} from 'ng-zorro-antd/message';

import {AuthService} from '@routes/auth/auth.service';

@Injectable()
export abstract class BaseService {
  paramsGet: any;
  url: string;

  constructor(
    protected http: HttpClient,
    protected authService: AuthService,
    protected message: NzMessageService,
  ) {
  }

  get(data?: any): any {
    if (data) { this.paramsGet = data; }
    let params = new HttpParams();
    for (const key in this.paramsGet) {
      if (this.paramsGet.hasOwnProperty(key)) { params = params.append(key, this.paramsGet[key]); }
    }
    return this.http
      .get(this.url, { params })
      .pipe(catchError(err => this.handleError(err)));
  }
  post(data: any): any {
    return this.http
      .post(this.url, data)
      .pipe(catchError(err => this.handleError(err)));
  }
  put(data: any, id: any): any {
    return this.http
      .put(this.url + '/' + id, data)
      .pipe(catchError(err => this.handleError(err)));
  }
  delete(id: any): any {
    return this.http
      .delete(this.url + '/' + id)
      .pipe(catchError(err => this.handleError(err)));
  }
  select(): any {
    return this.http
      .get(this.url + '/select')
      .pipe(catchError(err => this.handleError(err)));
  }

  handleError(err: HttpErrorResponse): any {
    if (err.status === 401) { this.authService.logout(); }
    if (err.error && err.error.message) { this.message.error(err.error.message); }
    return throwError(err.error);
  }
}
