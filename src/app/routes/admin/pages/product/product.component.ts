import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';

import {NzMessageService} from 'ng-zorro-antd/message';

import {environment} from '@src/environments/environment';
import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AuthService} from '@routes/auth/auth.service';
import {AdminService} from '@routes/admin/admin.service';
import {OrderService} from '@routes/admin/pages/order/order.service';

import {columns} from './product.column';
import {ProductService} from './product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [ProductService, OrderService]
})
export class ProductComponent extends BaseComponent implements OnInit, OnDestroy {
  private subCart: Subscription;
  private subUser: Subscription;
  user: Auth;
  langPrefix = 'routes.Admin.Product';
  @ViewChild('myTable') myTable;

  initShow = false;
  selectSize = '';
  isVisibleDetail = false;
  listTypeProduct = [];
  cart = [];
  listSizes = [];
  imageUrl?: string;
  newSizes = {size: '', quantity: 0};
  filterType = {};

  isVisibleQuantity = false;
  isVisibleBarcode = false;
  storageLinkedItemId;
  listProduct = [];

  isVisibleLink = false;
  dataLink = null;

  constructor(
    protected translate: TranslateService,
    protected service: ProductService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    private authService: AuthService,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
    super.onInit();
    this.subCart = this.adminService.cart$.subscribe(v => this.cart = v);

    this.service.getProductType().subscribe((res) => {
      this.listTypeProduct = res.data.content;
      this.initShow = true;
      this.subUser = this.authService.user.subscribe(v => {
        this.user = v;
        this.listOfColumns = columns(this);
      });
    });
  }

  ngOnDestroy(): void {
    this.subCart.unsubscribe();
    this.subUser.unsubscribe();
  }

  handleAddNew(): void {
    this.data = null;
    this.isVisible = true;
  }
  handleEdit(item): void {
    this.data = item;
    if (this.user.level === 10) {
      this.isVisible = true;
    } else if (this.user.level < 10 && item.storageLinkedItemId) {
      this.listSizes = item.sizeWithQuantity;
      this.listSizes = [];
      for (let i = 0; i <= 10; i++) {
        const size = (35 + i).toString();
        const checkQuantity = item.sizeWithQuantity.filter(product => product.size === size);
        this.listSizes.push({
          size,
          quantity: checkQuantity.length > 0 ? checkQuantity[0].quantity : 0
        });
      }
      this.isVisibleQuantity = true;
    }
  }


  handleDetail(item): void {
    this.service.getById(item.id).subscribe(({data}) => {
      this.data = data;
      this.isVisibleDetail = true;
      this.selectSize = '';
    });
  }
  handleCancelDetail(): void {
    this.isVisibleDetail = false;
  }
  handleDetailAddToCart(): void {
    this.handleAddToCart([{...this.data, size: this.selectSize}]);
    this.handleCancelDetail();
  }

  handleAddToCart(data): void {
    if (this.cart.filter((item) => item.itemId === data[0].id && item.size === data[0].size).length === 0) {
      const tempData = data.map(
        ({
           size,
           imageUrl,
           name,
           discountPercent,
           resellerUnitPrice1,
           resellerUnitPrice2,
           resellerUnitPrice3,
           isFreeShip,
           id,
           code
         }) => (
          {
            size: typeof size === 'object' ? size[0] : size,
            itemId: id,
            imageUrl,
            name,
            discountPercent,
            resellerUnitPrice1,
            resellerUnitPrice2,
            resellerUnitPrice3,
            isFreeShip,
            code
          }));
      this.cart = [...this.cart, ...tempData];
      localStorage.setItem(environment.cart, JSON.stringify(this.cart));
      this.adminService.cart$.next(this.cart);
    }
    this.myTable.onAllChecked();
  }

  handleCancelQuantity(): void {
    this.isVisibleQuantity = false;
  }
  handleQuantityAction(sizeWithQuantity): void {
    this.isLoading = true;
    this.service.put({sizeWithQuantity}, this.data.id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(res => {
        this.isVisibleQuantity = false;
        this.success(res.message);
      });
  }


  handleCancelBarcode(): void {
    this.isVisibleBarcode = false;
  }
  handlePrintBarcode(): void {
    this.isVisibleBarcode = true;
  }

  handleChangeType(value, name): void {
    if (this.filterType[name] !== value) {
      this.filterType[name] = value;
      this.myTable.filter(name, null, value);
    } else {
      this.myTable.resetFilter(null, name);
      this.filterType[name] = null;
    }
  }

  successLink(message): void {
    this.isVisibleLink = false;
    this.message.success(message);
  }

  handleCancelLink(): void {
    this.isVisibleLink = false;
  }

  handleEditLink(item): void {
    this.dataLink = item;
    this.isVisibleLink = true;
  }
}
