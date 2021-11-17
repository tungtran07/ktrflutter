import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {NzMessageService} from 'ng-zorro-antd/message';
import {catchError} from 'rxjs/operators';

import {environment} from '@src/environments/environment';
import {BaseService} from '@components/base-service';
import {AuthService} from '@routes/auth/auth.service';

@Injectable()
export class ProductService extends BaseService {
  url = environment.salesApiUrl + '/api/v1/items';
  paramsGetProduct: any;

  constructor(
    protected http: HttpClient,
    protected authService: AuthService,
    protected message: NzMessageService,
  ) {
    super(http, authService, message);
  }

  getById(id): any {
    return this.http
      .get(this.url + '/' + id)
      .pipe(catchError(err => this.handleError(err)));
  }

  getProductType(): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/itemtype', )
      .pipe(catchError(err => this.handleError(err)));
  }

  uploadFileBlobPhysical(file): any {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post(environment.adminApiUrl + '/api/v1/core/nodes/upload/physical/blob?destinationPhysicalPath=products', data)
      .pipe(catchError(err => this.handleError(err)));
  }

  getListProduct(data?): any {
    if (data) { this.paramsGetProduct = data; }
    let params = new HttpParams();
    for (const key in this.paramsGetProduct) {
      if (this.paramsGetProduct.hasOwnProperty(key)) { params = params.append(key, this.paramsGetProduct[key]); }
    }
    return this.http
      .get(environment.salesApiUrl + '/api/v1/items', { params })
      .pipe(catchError(err => this.handleError(err)));
  }
}
