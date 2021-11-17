import {
  AfterViewChecked,
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { finalize, pairwise } from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

import {NzMessageService} from 'ng-zorro-antd/message';

import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AuthService} from '@routes/auth/auth.service';
import {AdminService} from '@routes/admin/admin.service';
import {OrderService} from '@routes/admin/pages/order/order.service';
import {columns, columnsProduct} from '@routes/admin/pages/order/order.column';

@Component({
  selector: 'app-modal-edit-order',
  templateUrl: './modal-edit-order.component.html',
  styles: [
  ],
  encapsulation: ViewEncapsulation.None
})
export class ModalEditOrderComponent extends BaseComponent  implements OnInit, AfterViewChecked, OnDestroy, OnChanges {
  @Input() data;
  @Input() isVisible;

  @Output() cancelModal: EventEmitter<any> = new EventEmitter();
  @Output() changeModal: EventEmitter<any> = new EventEmitter();
  @ViewChild('tableProduct') tableProduct;

  private subUser: Subscription;
  user: Auth;

  isVisibleEdit = false;
  firstLoad = false;
  firstLoadProduct = false;

  isVisibleUser = false;
  listAccount = [];
  listShippingCarrier = [];
  listProvince = [];
  listDistrict = [];
  listCommune = [];
  @ViewChild('modalFormComponent') modalFormComponent;
  typeOrder: 'RETL';

  warningShipReturn = '';
  messageWarningNo = '';
  messageErrorNo = '';

  private subCart: Subscription;
  cart = [];

  private subForm: Subscription;

  columnsProduct = [];
  dataProduct;
  indexProduct;
  productSelect;
  isVisibleProduct = false;
  listProduct = [];
  listProductSize = [];
  suggestedPrices = [];
  setPrice;
  @ViewChild('formComponent') formComponent;

  minimumPrice = 0;
  dataPayment;
  tempData;
  confirmPayment;
  listShippingStatus = [
    {id: 1, name: 'Ship chậm', class: 'delay-ship'},
    {id: 5, name: 'Không ship', class: 'kl'},
  ];

  constructor(
    protected service: OrderService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    protected authService: AuthService,
    protected translate: TranslateService,
  ) {
    super(route, adminService, message, service);
  }

  ngAfterViewChecked(): void {
    if (!this.subForm && this.modalFormComponent && this.modalFormComponent.ngForm?.validateForm) {
      this.subForm = this.modalFormComponent.ngForm.validateForm.valueChanges
          .pipe(pairwise())
          .subscribe(([prev, next]: [any, any]) => {
            if (prev.customerProvinceId !== next.customerProvinceId
                || prev.customerCommuneId !== next.customerCommuneId
                || prev.customerDistrictId !== next.customerDistrictId) {
              this.dataPayment = null;
            }
          });
    }
  }

  ngOnInit(): void {
    this.subUser = this.authService.user.subscribe(v => {
      this.user = v;
      this.listOfColumns = columns(this);
    });
    this.subCart = this.adminService.cart$.subscribe(v => this.cart = v);
    this.service.getProvince().subscribe(res => {
      res.data.map(item => this.listProvince.push({value: item.maTinh, label: item.tenTinh, ...item}));
      this.service.getShippingCarrier().subscribe(({data}) => {
        data.map(item => this.listShippingCarrier.push({value: item, label: item, ...item}));
        this.listOfColumns = columns(this);
      });
    });
  }

  ngOnDestroy(): void {
    this.subCart.unsubscribe();
    this.subUser.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible) {
      if (changes.isVisible.currentValue) {
        this.isVisibleEdit = true;
        if (this.data.id) {
          this.isLoading = true;
          this.listDistrict = [];
          this.listCommune = [];
          this.service.getDistrict(this.data.customerProvinceId)
            .subscribe(res => {
              res.data.map(item => this.listDistrict.push({value: item.districtCode, label: item.districtName, ...item}));
              this.service.getCommune(this.data.customerDistrictId)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe((resCommune) => {
                  this.typeOrder = this.data.type;
                  resCommune.data.map(item => this.listCommune.push({
                    value: item.communeCode,
                    label: item.communeName
                  }));
                  this.listOfColumns = columns(this);
                  this.columnsProduct = columnsProduct(this, false, this.data.status);
                  this.firstLoad = true;
                }, () => this.handleCancel());
            }, () => this.handleCancel());
        } else {
          this.warningShipReturn = '';
          this.messageWarningNo = '';
          this.messageErrorNo = '';
          this.typeOrder = 'RETL';
          this.listOfColumns = columns(this);
          this.columnsProduct = columnsProduct(this, false, this.data.status);
          this.firstLoad = true;
        }
      } else {
        if (this.isVisible) {
          this.handleCancel();
        }
      }
    }
  }
  handleCancel(): void {
    this.isVisibleEdit = false;
    this.firstLoad = false;
    this.confirmPayment = false;
    this.dataPayment = null;
    this.warningShipReturn = '';
    this.messageWarningNo = '';
    this.messageErrorNo = '';
    this.subForm.unsubscribe();
    this.subForm = null;
    this.cancelModal.emit();
  }

  handleChangeType(value): void {
    this.typeOrder = value;
    this.columnsProduct = columnsProduct(this, false, this.data.status);
  }

  handleOk(type): any {
    if (this.data.invoiceItems.length === 0) {
      return this.translate.get('routes.Admin.Order.pleaseAddProduct').subscribe((res) => this.message.warning(res));
    }
    const {controls, statusChanges, status} = this.modalFormComponent.ngForm.validateForm;
    for (const i in controls) {
      if (controls.hasOwnProperty(i)) {
        controls[i].markAsDirty();
        controls[i].updateValueAndValidity();
      }
    }
    if (status === 'VALID' && this.data.invoiceItems.length > 0 && !this.messageErrorNo) {
      const checkProduct = this.data.invoiceItems.filter((item) => !item.retailUnitPrice);
      if (
        checkProduct.length === 0
        || this.modalFormComponent.ngForm.validateForm.value.type === 'PREP'
        ||  this.modalFormComponent.ngForm.validateForm.value.type === 'SHPE'
      ) {
        this.isLoading = true;
        const data = {
          invoice: this.modalFormComponent.ngForm.validateForm.value,
          invoiceItems: this.data.invoiceItems.map(({itemId, quantity, retailUnitPrice, size}) => ({
            itemId,
            quantity,
            retailUnitPrice,
            size
          })),
        };


        if (type === 2) {
          this.tempData = data;
          this.service.putPricePreview(data)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(({data: dataPayment}) => {
              this.dataPayment = dataPayment;
              this.confirmPayment = false;
            });
        } else {
          if (!!this.data.id) {
            this.service.put(data, this.data.id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => this.success(res.message));
          } else {
            this.service[type === 0 ? 'post' : 'postDraft'](data)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => this.success(res.message));
          }
        }
      } else {
        this.message.warning('Có ' + checkProduct.length + ' sản phẩm chưa thêm giá bán!');
      }
    }
  }
  success(message): void {
    this.isVisibleEdit = false;
    this.handleCancel();
    this.changeModal.emit(message);
  }
  handleShowUser(): void {
    this.isLoading = true;
    this.service.getAccount().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe((res) => {
      this.listAccount = res.data.content;
      this.isVisibleUser = true;
    });
  }
  handleCancelUser(): void {
    this.isVisibleUser = false;
  }
  searchFullAccount(value): void {
    this.isLoading = true;
    this.service.getAccount(value).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe((res) => {
      this.listAccount = res.data.content;
    });
  }
  handleSelectAccount(item): void {
    this.isLoading = true;
    if (this.listDistrict.length > 0) {
      for (let i = this.listDistrict.length - 1; i >= 0; i--) {
        this.listDistrict.splice(this.listDistrict[i], 1);
      }
    }
    if (this.listCommune.length > 0) {
      for (let i = this.listCommune.length - 1; i >= 0; i--) {
        this.listCommune.splice(this.listCommune[i], 1);
      }
    }
    this.service.getDistrict(item.accountAddress.provinceCode)
      .subscribe(res => {
        res.data.map(district => this.listDistrict.push({value: district.districtCode, label: district.districtName, ...district}));
        this.service.getCommune(item.accountAddress.districtCode)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe((resCommune) => {
            resCommune.data.map(commune => this.listCommune.push({value: commune.communeCode, label: commune.communeName}));
            this.modalFormComponent.ngForm.validateForm.controls.customerName.setValue(item.fullName);
            this.modalFormComponent.ngForm.validateForm.controls.customerPhone.setValue(item.phone);
            this.service.getByPhone(item.phone)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(({data}) => {
                if (data.isWarning) {
                  this.warningShipReturn = data.warningMessage;
                } else {
                  this.warningShipReturn = '';
                }
              });
            this.modalFormComponent.ngForm.validateForm.controls.customerProvinceId.setValue(item.accountAddress.provinceCode);
            this.modalFormComponent.ngForm.validateForm.controls.customerDistrictId.setValue(item.accountAddress.districtCode);
            this.modalFormComponent.ngForm.validateForm.controls.customerCommuneId.setValue(item.accountAddress.communeCode);
            this.modalFormComponent.ngForm.validateForm.controls.customerApartmentNumber.setValue(item.accountAddress.apartmentNumber);
            this.handleCancelUser();
          });
      });
  }

  handleAddNewProduct(): void {
    this.dataProduct = null;
    this.indexProduct = null;
    this.productSelect = null;
    this.isVisibleProduct = true;
    this.firstLoadProduct = true;
  }
  handleEditProduct(item, index): void {
    this.indexProduct = index + ((this.tableProduct.paramTable.pageIndex - 1) * this.tableProduct.paramTable.pageSize);
    this.dataProduct = item;
    this.isLoading = true;
    this.productSelect = null;
    this.isVisibleProduct = true;
    this.service.getListProduct({page: 1, size: 10, filter: JSON.stringify({fullTextSearch: '', id: item.itemId})})
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(res => {
        if (res.data.content.length > 0) {
          this.productSelect = res.data.content[0];
          this.listProduct = [{value: this.productSelect.id, label: this.productSelect.name}];
          this.listProductSize = this.productSelect.sizeWithQuantity.filter(product => product.quantity > 0).map(product => ({
            value: product.size,
            label: product.size,
            danger: product.quantity < 4
          }));

          this.service.getSuggestedPrices(this.productSelect.id).subscribe(({data}) => {
            this.minimumPrice = data.minimumPrice;
            this.suggestedPrices = data.suggestedPrices;
            this.setPrice = (value) => {
              this.formComponent.ngForm.validateForm.controls.retailUnitPrice.setValue(value);
            };
            if (item.retailUnitPrice) {
              setTimeout(() => {
                this.formComponent.ngForm.validateForm.controls.interest.setValue(item.retailUnitPrice - data.minimumPrice);
              }, 1000);
            }
            this.columnsProduct = columnsProduct(this, false, this.data.status);
            this.firstLoadProduct = true;
          });
        }
      });
  }
  handleCancelProduct(): void {
    this.isVisibleProduct = false;
    this.suggestedPrices = [];
    this.firstLoadProduct = false;
    this.dataProduct = null;
  }
  handleOkProduct(validateForm): void {
    if (validateForm.status === 'VALID') {
      if (!!this.dataProduct) {
        if (this.productSelect) {
          let indexProduct = -1;
          this.data.invoiceItems.filter((item, index) => {
            if (item.code === this.productSelect.code && item.size === validateForm.value.size && this.indexProduct !== index) {
              indexProduct = index;
              return true;
            }
            return false;
          });
          if (indexProduct === -1) {
            this.data.invoiceItems[this.indexProduct] = {...this.data.invoiceItems[this.indexProduct], ...this.productSelect};
          } else {
            const checkIndex = this.indexProduct < indexProduct;
            validateForm.value.quantity += this.data.invoiceItems[checkIndex ? this.indexProduct : indexProduct].quantity;
            this.data.invoiceItems.splice(checkIndex ? indexProduct : this.indexProduct, 1);
            this.indexProduct = checkIndex ? this.indexProduct : indexProduct;
          }
        }
        for (const key in validateForm.value) {
          if (validateForm.value.hasOwnProperty(key)) {
            this.data.invoiceItems[this.indexProduct][key] = validateForm.value[key];
          }
        }
      } else {
        const {
          code,
          imageUrl,
          name,
          discountPercent,
          resellerUnitPrice1,
          resellerUnitPrice2,
          resellerUnitPrice3,
          isFreeShip
        } = this.productSelect;
        this.data.invoiceItems.filter((item, index) => {
          if (item.code === code && item.size === validateForm.value.size) {
            this.indexProduct = index;
            return true;
          }
          return false;
        });
        if (this.indexProduct === null) {
          this.data.invoiceItems.push({
            ...validateForm.value,
            imageUrl,
            name,
            discountPercent,
            resellerUnitPrice1,
            resellerUnitPrice2,
            resellerUnitPrice3,
            isFreeShip
          });
        } else {
          this.data.invoiceItems[this.indexProduct].quantity += validateForm.value.quantity;
        }
      }
      this.data.invoiceItems = [...this.data.invoiceItems];
      this.handleCheckGetPricePreview();
      this.handleCancelProduct();
    }
  }
  handleAddProductFormCart(data): void {
    data.map(({
      size,
      imageUrl,
      name,
      discountPercent,
      resellerUnitPrice1,
      resellerUnitPrice2,
      resellerUnitPrice3,
      isFreeShip,
      itemId,
      code
    }) => {
      if (this.data.invoiceItems.filter((item, index) => item.code === code && item.size === size).length === 0) {
        this.data.invoiceItems.push({
          retailUnitPrice: null,
          quantity: 1,
          size,
          itemId,
          imageUrl,
          name,
          discountPercent,
          resellerUnitPrice1,
          resellerUnitPrice2,
          resellerUnitPrice3,
          isFreeShip,
          code
        });
      }
    });
    this.data.invoiceItems = [...this.data.invoiceItems];
    this.handleCheckGetPricePreview();
  }

  handleDeleteProduct(index: number): void {
    this.indexProduct = index + ((this.tableProduct.paramTable.pageIndex - 1) * this.tableProduct.paramTable.pageSize);
    this.data.invoiceItems.splice(this.indexProduct, 1);
    this.data.invoiceItems = [...this.data.invoiceItems];
    this.handleCheckGetPricePreview();
  }

  handleCheckGetPricePreview(): void {
    if (this.dataPayment) {
      this.isLoading = true;
      this.tempData = {
        invoice: this.tempData.invoice,
        invoiceItems: this.data.invoiceItems.map(({itemId, quantity, retailUnitPrice, size}) => ({
          itemId,
          quantity,
          retailUnitPrice,
          size
        })),
      };
      this.service.putPricePreview(this.tempData)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(({data: dataPayment}) => {
          this.dataPayment = dataPayment;
        });
    }
  }

  handleConfirmPayment(): void {
    this.confirmPayment = true;
  }

  getShippingStatus(status: number): any {
    return this.listShippingStatus.find(i => i.id === status);
  }
}
