import {Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {catchError} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';

import {NzMessageService} from 'ng-zorro-antd/message';

import {environment} from '@src/environments/environment';
import {BaseService} from '@components/base-service';
import {AuthService} from '@routes/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseService {
  collapsed$ = new BehaviorSubject(false);
  drawer$ = new BehaviorSubject(false);
  desktop$ = new BehaviorSubject(window.innerWidth > 767);
  link$ = new BehaviorSubject('');
  cart$ = new BehaviorSubject(JSON.parse(localStorage.getItem(environment.cart)) || []);

  isVisibleOrder$ = new BehaviorSubject(false);
  isVisibleEditOrder$ = new BehaviorSubject(false);
  order$ = new BehaviorSubject({});

  paramsGetDeposits = {
    page: 1,
    size: 10,
  };
  paramsGetTransactions = {
    page: 1,
    size: 10,
  };

  constructor(
    protected http: HttpClient,
    protected authService: AuthService,
    protected message: NzMessageService,
  ) {
    super(http, authService, message);
  }

  getProvince(): any {
    return this.http
      .get(environment.adminApiUrl + '/tinh', )
      .pipe(catchError(err => this.handleError(err)));
  }

  getDistrict(idProvince): any {
    let params = new HttpParams();
    params = params.append('filter', JSON.stringify({ParentId: idProvince}));
    return this.http
      .get(environment.adminApiUrl + '/huyen', { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getShipPrice(data): any {
    let params = new HttpParams();
    for (const key in this.paramsGet) {
      if (this.paramsGet.hasOwnProperty(key)) { params = params.append(key, this.paramsGet[key]); }
    }
    return this.http
      .get(environment.adminApiUrl + '/api/v1/bsd/address/getshipprice', { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getMyWallet(): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/wallet/me', )
      .pipe(catchError(err => this.handleError(err)));
  }
  getWalletSuggestedAmounts(): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/wallet/deposit/suggested-amounts', )
      .pipe(catchError(err => this.handleError(err)));
  }
  getWalletById(id): any {
    return this.http
        .get(environment.salesApiUrl + '/api/v1/wallets/' + id)
        .pipe(catchError(err => this.handleError(err)));
  }
  getListWalletDepositsById(data, id): any {
    if (data) { this.paramsGetDeposits = data; }
    let params = new HttpParams();
    for (const key in this.paramsGetDeposits) {
      if (this.paramsGetDeposits.hasOwnProperty(key)) { params = params.append(key, this.paramsGetDeposits[key]); }
    }
    return this.http
      .get(environment.salesApiUrl + '/api/v1/wallets/' + id + '/deposits', { params })
      .pipe(catchError(err => this.handleError(err)));
  }
  getListWalletTransactionsById(data, id): any {
    if (data) { this.paramsGetTransactions = data; }
    let params = new HttpParams();
    for (const key in this.paramsGetTransactions) {
      if (this.paramsGetTransactions.hasOwnProperty(key)) { params = params.append(key, this.paramsGetTransactions[key]); }
    }
    return this.http
      .get(environment.salesApiUrl + '/api/v1/wallets/' + id + '/transactions', { params })
      .pipe(catchError(err => this.handleError(err)));
  }
  createWalletDeposits(data): any {
    return this.http
      .post(environment.salesApiUrl + '/api/v1/wallet/deposits', data)
      .pipe(catchError(err => this.handleError(err)));
  }
  createWalletWithdrawals(data): any {
    return this.http
      .post(environment.salesApiUrl + '/api/v1/wallet/withdrawals', data)
      .pipe(catchError(err => this.handleError(err)));
  }
  updateDepositsConfirmTransferred(id): any {
    return this.http
      .put(environment.salesApiUrl + '/api/v1/wallet/deposits/' + id + '/confirm-transferred', {})
      .pipe(catchError(err => this.handleError(err)));
  }
  updateDepositsCancel(id, cancelReason = ''): any {
    return this.http
      .put(environment.salesApiUrl + '/api/v1/wallet/deposits/' + id + '/cancel', {cancelReason})
      .pipe(catchError(err => this.handleError(err)));
  }
  updateDepositsConfirmReceived(id): any {
    return this.http
      .put(environment.salesApiUrl + '/api/v1/wallet/deposits/' + id + '/confirm-received', {})
      .pipe(catchError(err => this.handleError(err)));
  }
  getNavigations(): any {
    return this.http
      .get(environment.adminApiUrl + '/api/v1/bsd/navigations/user/webapp', {})
      .pipe(catchError(err => this.handleError(err)));
  }
}
