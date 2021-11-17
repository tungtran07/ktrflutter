import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ActivatedRoute} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import {finalize} from 'rxjs/operators';
import {Subscription} from 'rxjs';

import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AuthService} from '@routes/auth/auth.service';
import {AdminService} from '@routes/admin/admin.service';

import { columns, columnsOutStock } from './order.column';
import {OrderService} from './order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [OrderService]
})
export class OrderComponent extends BaseComponent implements OnInit, OnDestroy {
  langPrefix = 'routes.Admin.Order';
  private subUser: Subscription;
  private subIsVisibleOrder: Subscription;
  private subIsVisibleEditOrder: Subscription;

  user: Auth;
  allowStatus = [];

  filterPrint: any;

  @ViewChild('myTable') myTable;
  @ViewChild('contentDropdownTemplate') contentDropdownTemplate;

  status: string;
  listStatus = [
    'DRAFT',
    'WAIT_CONFIRM',
    'INPROCESS',
    'SHIP_COLLECTED',
    'SHIP_DELIVERED',
    'SHIP_RETURN',
    'OUT_OF_STOCK',
    'CANCEL',
    'COMPLETED',
    'WHSL_COMPLETED',
    'SHIP_ACCEPTED',
  ];

  listType = [
    'RETL',
    'PREP',
    'SHPE',
  ];
  type = '';

  counts = {};
  isVisiblePrint = false;

  isVisibleCount = false;
  listCountItem = [];
  isLoadingAction = false;

  isVisibleReason = false;
  listReason = [];
  reason = '';
  reasonValue = '';

  isVisibleOutStock = false;
  listOutStock = [];
  columnsOutStock = columnsOutStock(this);

  constructor(
    private translate: TranslateService,
    protected service: OrderService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
  ) {
    super(route, adminService, message, service);
  }
  ngOnInit(): void {
    super.onInit();
    this.subIsVisibleOrder = this.adminService.isVisibleOrder$.subscribe(v => {
      if (!v) {
        this.updateCount();
      }
    });
    this.subIsVisibleEditOrder = this.adminService.isVisibleEditOrder$.subscribe(v => {
      if (!v) {
        this.updateCount();
      }
    });
    this.subUser = this.authService.user.subscribe(v => {
      this.user = v;
      if (this.user.level > 8) {
        this.listType.push('WHSL');
      }
      this.listWidthStatus.INPROCESS = v.userModel.level > 8 ? '100px' : null;
      this.route.queryParams.subscribe(queryParams => {
        this.status = !!queryParams.filter && typeof JSON.parse(queryParams.filter).Status !== 'undefined'
          ? JSON.parse(queryParams.filter).Status
          : 'WAIT_CONFIRM';
        this.type = !!queryParams.filter && typeof JSON.parse(queryParams.filter).type !== 'undefined'
          ? JSON.parse(queryParams.filter).type
          : '';
        setTimeout(() => {
          this.listOfColumns = columns(this);
        });
      });
    });
    this.updateCount();
  }

  updateCount(): void {
    this.counts = {};
    this.listStatus.map((item) => {
      this.service.getCount(item).subscribe((res) => this.counts[item] = res.data);
    });
  }

  ngOnDestroy(): void {
    this.subUser.unsubscribe();
    this.subIsVisibleOrder.unsubscribe();
    this.subIsVisibleEditOrder.unsubscribe();
  }

  handleChangeStatus(Status: string): void {
    this.status = Status;
    this.listOfColumns = columns(this);
    this.myTable.filter('isPrinted', null, null);
    this.filterPrint = '{}';
    this.myTable.filter('Status', null, this.status);
  }

  handleChangeType(type: string): void {
    this.type = type;
    this.myTable.filter('type', null, this.type);
  }
  onChange(data): void {
    if (data) {
      let oldFilter = JSON.parse(data.filter);
      if (this.user.level > 8) {
        oldFilter = {...oldFilter, listStatus: ['INPROCESS', 'WAIT_CONFIRM', 'OUT_OF_STOCK', 'CANCEL', 'SHIP_COLLECTED', 'SHIP_RETURN', 'SHIP_DELIVERED', 'COMPLETED', 'SHIP_ACCEPTED']};
      }
      if (data && data.filter && !oldFilter.Status) {
        oldFilter = {...oldFilter, Status: this.status};
      }
      data.filter = JSON.stringify(oldFilter);
    }
    this.updateCount();
    super.onChange(data);
  }


  handleAddNew(): void {
    this.adminService.isVisibleEditOrder$.next(true);
    this.adminService.order$.next({invoiceItems: [], type: 'RETL'});
  }
  handleEdit(): void {
    this.isLoading = false;
    this.service.getDetail(this.data.id).subscribe((res) => {
      this.adminService.isVisibleEditOrder$.next(true);
      this.adminService.order$.next(res.data);
    });
  }
  handleDetail(item): void {
    this.adminService.isVisibleOrder$.next(true);
    this.adminService.order$.next(item);
  }
  handleChangeStatusOrder(status: string): void {
    this.isLoading = true;
    switch (status) {
      case 'EDIT':
        return this.handleEdit();
      case 'CANCEL':
        return this.service
          .getReasonsCancelOrder()
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(res => {
            this.listReason = res;
            this.reason = res[0];
            this.reasonValue = '';
            this.isVisibleReason = true;
          });
      case 'OUT_OF_STOCK':
        return this.service
          .getDetail(this.data.id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(({data}) => {
            this.listOutStock = data.invoiceItems;
            this.isVisibleOutStock = true;
          });
      case 'REORDER':
        return this.service
          .updateReorder(this.data.orderNo)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe((res) => {
            if (res.message) {
              this.message.success(res.message);
            }
            this.onChange(null);
          });
      default:
        return this.service.changeStatus(this.data.id, status)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(res => {
            if (res.message) {
              this.message.success(res.message);
            }
            this.onChange(null);
            this.updateCount();
            this.isLoadingAction = true;
            this.service
              .getAllowedActions(this.data.id)
              .pipe(finalize(() => this.isLoadingAction = false))
              .subscribe((resAllowedAction) => {
                this.allowStatus = resAllowedAction.data;
              });
          });
    }
  }

  handleCancelReasons(): void {
    this.isVisibleReason = false;
  }
  handleOkCancelReason(): void {
    this.isLoading = true;
    const reason = this.reason !== '0' ? this.reason : this.reasonValue;
    this.service
      .updateOrderCancel(this.data.id, reason)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((res) => {
        this.message.success(res.message);
        this.isVisibleReason = false;
        this.onChange(null);
      });
  }
  handleCancelOutStock(): void {
    this.isVisibleOutStock = false;
  }
  handleOkOutStock(): void {
    const data = [];
    this.listOutStock.map(({id, code, isOutOfStock}) => data.push({invoiceitemid: id, itemCode: code, isOutOfStock}));
    this.service
      .updateOrderOutStock(this.data.orderNo, data)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe((res) => {
        this.message.success(res.message);
        this.isVisibleOutStock = false;
        this.onChange(null);
      });
  }
  handleSetAllOutStock(isOutOfStock): void {
    this.listOutStock = this.listOutStock.map((item) => ({...item, isOutOfStock}));
  }

  handleCancelPrint(): void {
    this.isVisiblePrint = false;
  }
  handlePrint(): void {
    this.isVisiblePrint = true;
  }
  handleShowAllowStatus(data): void {
    this.data = data;
    this.isLoadingAction = true;
    this.allowStatus = [];
    this.service
      .getAllowedActions(data.id)
      .pipe(finalize(() => this.isLoadingAction = false))
      .subscribe((res) => {
        this.allowStatus = res.data;
      });
  }
  handleFilterPrint(value): void {
    if (value !== '{}') {
      const newFilter = JSON.parse(value);
      for (const key in newFilter) {
        if (newFilter.hasOwnProperty(key)) {
          if (!!this.route.snapshot.queryParams.filter) {
            const filter = JSON.parse(this.route.snapshot.queryParams.filter);
            this.myTable.filter('isPrinted', null, null);
          }
          this.myTable.filter(key, null, newFilter[key]);
        }
      }
    } else if (!!this.route.snapshot.queryParams.filter) {
      this.myTable.filter('isPrinted', null, null);
    }
  }

  actionPrint(el): void {
    const win = window.open('', 'Print', 'height=800,width=800');
    win.document.write(`<html><head></head><body></body></html>`);
    const head = win.document.querySelector('head');
    document.querySelectorAll('style, link').forEach(node => {
      head.appendChild(node.cloneNode(true));
    });
    win.document.querySelector('body').innerHTML = el.outerHTML;
    win.document.close();

    win.focus();
    // Waiting dom rendering to completed
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  }
  handleCountItem(data): void {
    this.isLoading = true;
    const listCode = data.map(item => item.orderNo);
    this.service
        .getCountItemInLocationByOrder(listCode)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe((res) => {
          this.listCountItem = res.data;
          this.isVisibleCount = true;
        });
  }
  handleCancelCountItem(): void {
    this.isVisibleCount = false;
  }
  handlePrintCountItem(): void {
    this.actionPrint(document.getElementById('printCount'));
  }
  renderSize(array): string {
    return array.map(item => item.size + 'x' + item.quantity).join(', ');
  }
}

