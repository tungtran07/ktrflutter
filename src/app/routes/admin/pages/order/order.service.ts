import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

import {NzMessageService} from 'ng-zorro-antd/message';

import {environment} from '@src/environments/environment';
import {BaseService} from '@components/base-service';
import {AuthService} from '@routes/auth/auth.service';

@Injectable()
export class OrderService extends BaseService {
  url = environment.salesApiUrl + '/api/v1/sales';
  user = JSON.parse(localStorage.getItem(environment.userData));
  paramsGetProduct = {};
  constructor(
    protected http: HttpClient,
    protected authService: AuthService,
    protected message: NzMessageService,
  ) {
    super(http, authService, message);
  }
  post(data: any): any {
    data.invoice.comCode = 'DCS';
    return this.http
      .post(this.url + '/wait', data)
      .pipe(catchError(err => this.handleError(err)));
  }
  postDraft(data: any): any {
    data.invoice.comCode = 'DCS';
    return this.http
      .post(this.url + '/draft', data)
      .pipe(catchError(err => this.handleError(err)));
  }
  getDetail(id):any {
    return this.http
      .get(this.url + '/' + id, )
      .pipe(catchError(err => this.handleError(err)));
  }
  getCount(data?: any): any {
    let params = new HttpParams();
    params = params.append('filter', JSON.stringify({listStatus: [data]}))
    return this.http
      .get(this.url + '/count', { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getProvince(): any {
    return this.http
      .get(environment.adminApiUrl + '/tinh', )
      .pipe(catchError(err => this.handleError(err)));
  }

  getDistrict(idProvince): any {
    let params = new HttpParams();
    params = params.append('filter', JSON.stringify({ParentId: idProvince}))
    return this.http
      .get(environment.adminApiUrl + '/huyen', { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  getCommune(idDistrict): any {
    let params = new HttpParams();
    params = params.append('filter', JSON.stringify({ParentId: idDistrict}))
    return this.http
      .get(environment.adminApiUrl + '/phuong', { params })
      .pipe(catchError(err => this.handleError(err)));
  }

  changeStatus(orderId: string, status: string): any {
    return this.http
      .put(this.url + `/change/${orderId}/${status}`, {})
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

  getOrderShippingAndDeliveryLog(orderNo): any {
    return this.http
      .get(this.url + '/vnpost/shipping-log/' + orderNo, )
      .pipe(catchError(err => this.handleError(err)));
  }

  getBase64Barcode({code, width, height}): any {
    return this.http
      .get(environment.salesApiUrl + `/api/v1/barcode/${code}/base64/${width}/${height}`, )
      .pipe(catchError(err => this.handleError(err)));
  }
  updatePrintCount(data: any): any {
    return this.http
      .put(environment.salesApiUrl + '/print_count', data)
      .pipe(catchError(err => this.handleError(err)));
  }

  getCountItemInLocationByOrder(data):any {
    return this.http
      .post(this.url + '/item-location-summary?printCount=1', data)
      .pipe(catchError(err => this.handleError(err)));
  }
  changeShippingCompany(orderId: string, companyName: string): any {
    return this.http
      .put(`${this.url}/${orderId}/shipping-company/${companyName}`, {})
      .pipe(catchError(err => this.handleError(err)));
  }
  getAllowedActions(orderId: string): any {
    return this.http
      .get(`${this.url}/${orderId}/allowed-actions`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getAccount(fullTextSearch = '', ): any {
    let params = new HttpParams();
    params = params.append('filter', JSON.stringify({fullTextSearch}));
    params = params.append('size', '10');
    return this.http
      .get(`${environment.salesApiUrl}/api/v1/crm/accounts/all`, { params })
      .pipe(catchError(err => this.handleError(err)));
  }
  getReasonsCancelOrder(): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/reasons/cancel-order')
      .pipe(catchError(err => this.handleError(err)));
  }
  updateOrderCancel(orderId: string, reason: string): any {
    return this.http
      .put(`${environment.salesApiUrl}/api/v1/sales/${orderId}/cancel`, {reason})
      .pipe(catchError(err => this.handleError(err)));
  }
  updateOrderOutStock(orderNo: string, invoiceItems: any): any {
    return this.http
      .put(`${environment.salesApiUrl}/api/v1/orders/${orderNo}/out-of-stock`, {invoiceItems})
      .pipe(catchError(err => this.handleError(err)));
  }
  updateReorder(orderNo: string): any {
    return this.http
      .put(`${environment.salesApiUrl}/api/v1/orders/${orderNo}/reorder`, {},{params: {excludeOutOfStock: "true"}})
      .pipe(catchError(err => this.handleError(err)));
  }
  getByPhone(phoneNumber: string): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/crm/customers/by-phone/' + phoneNumber)
      .pipe(catchError(err => this.handleError(err)));
  }
  checkNoShoppe(noShoppe: string): any {
    return this.http
      .put(`${environment.salesApiUrl}/api/v1/sales/shopee/order-numbers/${noShoppe}/validate`, {})
      .pipe(catchError(err => this.handleError(err)));
  }
  getSuggestedPrices(itemId: string): any {
    return this.http
      .get(`${environment.salesApiUrl}/api/v1/items/${itemId}/suggested-prices/`)
      .pipe(catchError(err => this.handleError(err)));
  }

  getShippingCarrier(): any {
    return this.http
      .get(environment.salesApiUrl + '/api/v1/sales/shopee/shipping-carriers', )
      .pipe(catchError(err => this.handleError(err)));
  }
  getByIdToAttachmentsTemplate(id: string): any {
    return this.http
      .get(`${this.url}/${id}/attachments/template`)
      .pipe(catchError(err => this.handleError(err)));
  }
  createAttachmentsTemplate(id: string, data): any {
    return this.http
      .post(`${this.url}/${id}/attachments`, data)
      .pipe(catchError(err => this.handleError(err)));
  }
  getAttachments(id: string): any {
    return this.http
      .get(`${this.url}/${id}/attachments`)
      .pipe(catchError(err => this.handleError(err)));
  }
  deleteImage(idOrder, id): any {
    return this.http
      .delete(`${this.url}/${idOrder}/attachments/${id}`, {})
      .pipe(catchError(err => this.handleError(err)));
  }
  putPricePreview(order): any {
    return this.http
      .put(`${environment.salesApiUrl}/api/v1/sales/price-preview`, order)
      .pipe(catchError(err => this.handleError(err)));
  }
}
