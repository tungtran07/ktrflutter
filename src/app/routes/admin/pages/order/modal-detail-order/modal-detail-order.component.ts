import {Component, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import GLightbox from 'glightbox';

import {NzMessageService} from 'ng-zorro-antd/message';
import {NzUploadFile} from 'ng-zorro-antd/upload';

import {environment} from '@src/environments/environment';
import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AuthService} from '@routes/auth/auth.service';
import {AdminService} from '@routes/admin/admin.service';

import {OrderService} from '@routes/admin/pages/order/order.service';
import {columnsProduct, columnsThongTinPhat, columnsThongTinTrangThai} from '@routes/admin/pages/order/order.column';

@Component({
  selector: 'app-modal-detail-order',
  templateUrl: './modal-detail-order.component.html',
  styles: [],
  encapsulation: ViewEncapsulation.None,
  providers: [OrderService]
})
export class ModalDetailOrderComponent extends BaseComponent implements OnInit, OnChanges {
  langPrefix = 'routes.Admin.Order';

  isVisibleDetail = false;
  user: Auth;
  columnsProduct;
  columnsThongTinTrangThai = columnsThongTinTrangThai(this);
  columnsThongTinPhat = columnsThongTinPhat(this);

  shippingLog = {};
  data;
  allowStatus = [];
  listHistoryScan = [];
  totalQuantityProduct = 0;
  listWidthStatus = {
    '': '100px',
    DRAFT: '100px',
    WAIT_CONFIRM: '100px',
    WHSL_COMPLETED: '100px',
    INPROCESS: '100px',
    OUT_OF_STOCK: '100px',
    CANCEL: '100px',
  };
  listScanType = [
    {value: 'CONFIRM', label: 'Kiểm hàng lên xe'},
    {value: 'COD', label: 'Kiểm tiền COD'},
    {value: 'RETURN', label: 'Kiểm đơn bom'},
    {value: 'COMPLETED', label: 'Kiểm đơn hoàn thành'},
  ];
  typeOrder: 'RETL';


  infoUpload;
  urlUpload;
  listUpload = [];
  previewImage;
  previewVisible = false;
  isVisibleWallet = false;
  listDeposits = [];
  totalDeposits = 0;
  listTransactions = [];
  totalTransactions = 0;

  wallet: any;

  @Input() id;
  @Input() isVisible;
  @Output() cancelModal = new EventEmitter<string>();
  @Output() changeLoading = new EventEmitter<boolean>();
  @Output() changeStatusOrder = new EventEmitter<string>();

  constructor(
    protected service: OrderService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    private authService: AuthService,
    private router: Router,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
    this.authService.user.subscribe(v => this.user = v);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible) {
      if (changes.isVisible.currentValue) {
        this.isVisibleDetail = true;
        this.handleChangeLoading(true);
        if (this.changeStatusOrder) {
          this.service
            .getAllowedActions(this.id)
            .subscribe((res) => {
              this.allowStatus = res.data;
            });
        }
        this.service.getDetail(this.id)
          .pipe(finalize(() => this.handleChangeLoading(false)))
          .subscribe(({data}) => {
            this.typeOrder = data.type;
            this.data = data;
            this.totalQuantityProduct = 0;
            this.data.invoiceItems.map(item => this.totalQuantityProduct += item.quantity);

            if (data.type === 'SHPE' && data.status !== 'WAIT_CONFIRM') {
              this.service
                .getByIdToAttachmentsTemplate(this.id)
                .subscribe((res) => {
                  this.infoUpload = res.data[0];
                  this.urlUpload = environment.adminApiUrl + '/api/v1/core/nodes/upload/physical/blob?destinationPhysicalPath='
                    + this.infoUpload.prefix;
                });
              this.service.getAttachments(this.id).subscribe((res) => {
                this.listUpload = [];
                res?.data?.map(attach => {
                  this.listUpload.push({
                    uid: attach.id,
                    name: this.formatDate(attach.createdOnDate) + ' - ' + attach.docTypeName,
                    status: 'done',
                    url: attach?.file
                  });
                });
              });
            }
            if (data.status !== 'WAIT_CONFIRM' && data.status !== 'DRAFT' && data.type !== 'WHSL') {
              this.handleChangeLoading(true);
              this.service.getOrderShippingAndDeliveryLog(data.orderNo)
                .pipe(finalize(() => this.handleChangeLoading(false)))
                .subscribe(res => {
                  this.shippingLog = res.data;
                  this.columnsProduct = columnsProduct(this, true, this.data.status);
                });
            } else {
              this.columnsProduct = columnsProduct(this, true, this.data.status);
            }
        }, () => this.handleCancelDetail());

      } else {
        if (this.isVisibleDetail) {
          this.handleCancelDetail();
        }
      }
    }
  }

  handleChangeStatusOrder(status: string): void {
    this.changeStatusOrder.emit(status);
    this.handleCancelDetail();
  }

  handleChangeLoading(status: boolean): void {
    this.isLoading = status;
  }

  handleCancelDetail(): void {
    this.isVisibleDetail = false;
    this.data = null;
    this.shippingLog = {};
    this.cancelModal.emit();
  }

  onSwitchShippingCompany(): void {
    if (this.data.invoiceShipping)
    {
      if (this.data.invoiceShipping.shipperCompanyName === 'VIETTELPOST') {
        this.data.invoiceShipping.shipperCompanyName = 'VNPOST';
      } else {
        this.data.invoiceShipping.shipperCompanyName = 'VIETTELPOST';
      }
      this.handleChangeLoading(true);
      this.service
        .changeShippingCompany(this.data.id, this.data.invoiceShipping.shipperCompanyName)
        .subscribe(res => {
          this.service
            .getDetail(this.data.id)
            .pipe(finalize(() => this.handleChangeLoading(false)))
            .subscribe(({data: detail}) => this.data = detail);
          this.message.success(res.message);
        });
    }
  }

  handleChangeIndex(index: number): void {
    if (index === 1) {
      setTimeout(() => GLightbox(), 500);
    }
  }

  goToScan(param): void {
    this.handleCancelDetail();
    this.router.navigate(['./admin/scan-sessions', param.scanSessionId], { queryParams: {...param, name: param.sessionName, id: param.scanSessionId}, });
  }

  handleUpload(data): void {
    if (data.type === 'success') {
      this.isLoading = true;
      this.service
        .createAttachmentsTemplate(this.id, {...this.infoUpload, file: data.file.response.data.physicalPath})
        .pipe(finalize(() => this.isLoading = false))
        .subscribe((res) => {
          this.service.getAttachments(this.id).subscribe(({data: attachments}) => {
            this.listUpload = [];
            attachments?.map(attach => {
              this.listUpload.push({
                uid: attach.id,
                name: this.formatDate(attach.createdOnDate) + ' - ' + attach.docTypeName,
                status: 'done',
                url: attach?.file
              });
            });
          });
          this.message.success(res.message);
        });
    }
  }

  handlePreview = async (file: NzUploadFile) => {
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  }
  handleRemove = (file: NzUploadFile) => {
    this
      .service
      .deleteImage(this.id, file.uid)
      .subscribe(res => {
        this.service.getAttachments(this.id).subscribe(({data: attachments}) => {
          this.listUpload = [];
          attachments?.map(attach => {
            this.listUpload.push({
              uid: attach.id,
              name: this.formatDate(attach.createdOnDate) + ' - ' + attach.docTypeName,
              status: 'done',
              url: attach?.file
            });
          });
        });
        this.message.success(res.message);
      }, () => false);
  }

  handleCancelWallet(): void {
    this.isVisibleWallet = false;
  }

  onChangeDeposits(data): void {
    if (this.wallet?.id) {
      this
          .adminService
          .getListWalletDepositsById(data, this.wallet.id)
          .subscribe((res) => {
            this.listDeposits = res.data.content;
            this.totalDeposits = res.data.totalElements;
          });
    }
  }
  onChangeTransactions(data): void {
    if (this.wallet?.id) {
      this
          .adminService
          .getListWalletTransactionsById(data, this.wallet.id)
          .subscribe((res) => {
            this.listTransactions = res.data.content;
            this.totalTransactions = res.data.totalElements;
          });
    }
  }

  onOpenWallet(): void {
    this.adminService.getWalletById(this.data.createdByUserId).subscribe((res) => {
      if (res?.data) {
        this.wallet = res.data;
        this.isVisibleWallet = true;
        this.onChangeDeposits({page: 1, size: 10});
        this.onChangeTransactions({page: 1, size: 10});
      }
    });
  }
}
