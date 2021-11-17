import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import {BehaviorSubject, throwError} from 'rxjs';
import {Router} from '@angular/router';

import {NzMessageService} from 'ng-zorro-antd/message';

import { environment } from '@src/environments/environment';

import { Auth } from './auth.model';

export interface AuthResponseData {
  userId: string;
  level: number;
  tokenString: string;
  issuedAt: Date;
  expiresAt: Date;
  userModel: any;
}

export interface AuthRequestData {
  loginName: string;
  password: string;
  name?: string;
  rememberMe?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<Auth>(null);

  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    protected message: NzMessageService,
  ) {
  }

  autoLogin(): void {
    const userData: AuthResponseData = JSON.parse(localStorage.getItem(environment.userData));
    if (!userData) {
      return;
    }
    const {userId, level, tokenString, expiresAt, issuedAt, userModel} = userData;
    const loadedUser = new Auth(userId, level, tokenString, expiresAt, issuedAt, userModel);

    if (loadedUser.token) {
      this.user.next(loadedUser);
      // const expiration = new Date().getTime() - (new Date(expiresAt).getTime() + 10000);
      // this.autoLogout(expiration);
    }
  }

  signUp(data: AuthRequestData): any {
    return this.http
      .post<AuthResponseData>(environment.adminApiUrl + '/api/v1/idm/users/register', {...data})
      .pipe(
        catchError(err => this.handleError(err)),
        tap((res: any) => this.message.success(res.message))
      );
  }

  signIn(data: AuthRequestData): any {
    return this.http
      .post<AuthResponseData>(environment.adminApiUrl + '/api/v1/authentication/jwt/login', { ...data })
      .pipe(
        catchError(err => this.handleError(err)),
        tap((res: any) => this.handleAuthentication(res.data))
      );
  }

  forgotPass(phoneNumber: String): any {
    return this.http
      .put<AuthResponseData>(environment.adminApiUrl + '/api/v1/idm/users/forgotpassword/' + phoneNumber, {})
      .pipe(
        catchError(err => this.handleError(err)),
        tap((res: any) => this.message.success(res.message))
      );
  }

  logout(): void {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem(environment.userData);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  handleError(err: HttpErrorResponse): any {
    if (err.error.message) {
      this.message.error(err.error.message);
    }
    return throwError(err.error);
  }

  private handleAuthentication(data: AuthResponseData): void {
    data.level = 1;
    const roleLvl2 = data['listRole'].filter(x => x.code === 'CONTRIBUTOR_LV2');
    if (roleLvl2 && roleLvl2.length > 0) {
      data.level = 2;
    }

    const roleLvl3 = data['listRole'].filter(x => x.code === 'CONTRIBUTOR_LV3');
    if (roleLvl3 && roleLvl3.length > 0) {
      data.level = 3;
    }

    const roleStaff = data['listRole'].filter(x => x.code === 'STAFF');
    if (roleStaff && roleStaff.length > 0) {
      data.level = 9;
    }

    const roleAdmin = data['listRole'].filter(x => x.code === 'SYS_ADMIN');
    if (roleAdmin && roleAdmin.length > 0) {
      data.level = 10;
    }


    const user = new Auth(data.userId, data.level, data.tokenString, data.expiresAt, data.issuedAt, data.userModel);
    // const expiration = new Date().getTime() - (new Date(data.expiresAt).getTime() + 10000);
    // this.autoLogout(expiration);
    this.user.next(user);
    localStorage.setItem(environment.userData, JSON.stringify(data));
  }
}
