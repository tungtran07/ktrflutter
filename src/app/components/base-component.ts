import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {finalize} from 'rxjs/operators';
import * as moment from 'moment';

import {NzMessageService} from 'ng-zorro-antd/message';

import {DatatableModel} from '@components/datatable/datatable.model';
import {AdminService} from '@routes/admin/admin.service';

@Injectable()
export abstract class BaseComponent {
  totalItem: number;
  isLoading = false;
  listOfData = [];
  langPrefix: string;

  listOfColumns: DatatableModel[];
  isVisible = false;
  data = null;

  listColorStatus = {
    EDIT: '#318200',
    DRAFT: '#f4f5f8',
    WAIT_CONFIRM: '#318200',
    WAIT_TRANSFER: '#318200',
    CONFIRM_RECEIVED: '#318200',
    CONFIRM_TRANSFERRED: '#318200',
    COMPLETE: '#318200',
    APPROVE: '#318200',
    COMPLETED: '#3dc2ff',
    VALID: '#318200',
    WHSL_COMPLETED: '#FFA800',
    COD: '#318200',
    INPROCESS: '#5260ff',
    APPROVED: '#5260ff',
    BANK_TRANSFER: '#5260ff',
    REORDER: '#2DD36F',
    SHIP_COLLECTED: '#FFA800',
    CONFIRM: '#FFA800',
    SHIP_DELIVERED: '#2DD36F',
    SHIP_ACCEPTED: '#2DD36F',
    SHIP_RETURN: '#222428',
    RETURN: '#222428',
    OUT_OF_STOCK: '#EB445A',
    INVALID: '#EB445A',
    DELETE: '#EB445A',
    REJECT: '#EB445A',
    CANCEL: '#92949C',
    CANCELED: '#92949C',
    NOT_AVAILABLE: '#92949C',
  };

  listActionStatus = {
    EDIT: 'edit',
    WAIT_CONFIRM: 'sent',
    INPROCESS: 'apply',
    OUT_OF_STOCK: 'outOfStock',
    CANCEL: 'cancellation',
    REORDER: 'reorder',
    APPROVE: 'Phê duyệt',
    REJECT: 'Từ chối',
    DELETE: 'Xóa',
    COMPLETE: 'Hoàn thành',
    CONFIRM_RECEIVED: 'Xác nhận tiền về',
    CONFIRM_TRANSFERRED: 'Xác nhận chuyển khoản',
    SHIP_ACCEPTED: 'SHIP_ACCEPTED',
  };

  listAllowPostOrderCode = [
    'DRAFT',
    'WAIT_CONFIRM',
    'WHSL_COMPLETED',
  ];
  listScanValidated = [
    'INPROCESS',
    'COMPLETED',
    'SHIP_RETURN',
  ];

  listWidthStatus = {
    '': '100px',
    DRAFT: '100px',
    WAIT_CONFIRM: '100px',
    WHSL_COMPLETED: '100px',
    INPROCESS: '100px',
    OUT_OF_STOCK: '100px',
    CANCEL: '100px',
  };

  protected constructor(
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    protected message: NzMessageService,
    protected service: any,
  ) {}


  onInit(): void {
    this.route.url.subscribe(url => this.adminService.link$.next(url[0].path));
  }
  formatCurrency(money: number): string {
    return (money ? money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0') + '₫';
  }
  formatDate(date: any, format = 'HH:mm DD/MM/YY'): string {
    return date ? moment(date).format(format) : '';
  }
  handleCancel(): void {
    this.isVisible = false;
  }
  handleEdit(item): void {
    this.isVisible = true;
    this.data = item;
  }
  handleAddNew(): void {
    this.data = null;
    this.isVisible = true;
  }
  onChange(data): void {
    this.isLoading = true;
    this.service.get(data)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(res => {
      this.listOfData = res.data.content;
      this.totalItem = res.data.totalElements;
    });
  }
  handleOk(validateForm): void {
    if (validateForm.status === 'VALID') {
      this.isLoading = true;
      if (!!this.data?.id) {
        this.service.put(validateForm.value, this.data.id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(res => this.success(res.message));
      } else {
        this.service.post(validateForm.value)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(res => this.success(res.message));
      }
    }
  }
  handleDelete(item): void {
    this.isLoading = true;
    this.service.delete(item.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(res => this.success(res.message));
  }

  handleChangeLoading(status: boolean): void {
    this.isLoading = status;
  }

  success(message): void {
    this.isVisible = false;
    this.message.success(message);
    this.onChange(null);
  }

  pickTextColorBasedOnBgColorAdvanced = (bgColor, lightColor, darkColor) => {
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.4) ? darkColor : lightColor;
  }
}
