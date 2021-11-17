import {Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from '@routes/auth/auth.service';
import {Subscription} from 'rxjs';
import * as moment from 'moment';
import {NzMessageService} from 'ng-zorro-antd/message';
import {finalize} from 'rxjs/operators';

import {environment} from '@src/environments/environment';
import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AdminService} from '@routes/admin/admin.service';
import {OrderService} from '@routes/admin/pages/order/order.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [OrderService]
})
export class HeaderComponent extends BaseComponent implements OnInit, OnDestroy {
  private subUser: Subscription;
  private subCollapsed: Subscription;
  private subDrawer: Subscription;
  private subDesktop: Subscription;
  private subLink: Subscription;
  private subCart: Subscription;
  private subIsVisibleOrder: Subscription;
  private subIsVisibleEditOrder: Subscription;
  private subOrder: Subscription;
  @ViewChild('modalFormComponent') modalFormComponent;

  cart = [];

  isVisible = false;
  isCollapsed: boolean;
  isDrawer: boolean;
  isDesktop: boolean;
  link: string;
  loading = false;
  visibleProfile = false;
  listProvince = [];
  listDistrict = [];
  user: Auth;
  langPrefix = 'routes.Admin.Header';
  links = {
    order: 'Order',
    product: 'Product',
    user: 'User',
    setting: 'Setting',
    dashboard: 'Dashboard',
    interests: 'Interests',
    customer: 'Customer',
    wallet: 'Wallet',
    'balance-messages': 'Balance Messages',
    'payment-request': 'Payment Request',
    'wallet-deposits': 'Wallet Deposits',
    'scan-sessions': 'Scan Sessions',
    'register-code': 'RegisterCode',
    CONFIRM: 'CONFIRM',
    COD: 'COD',
    RETURN: 'RETURN',
    COMPLETED: 'COMPLETED',
    'wallet-withdrawals': 'Wallet Withdrawals',
    navigation: 'Navigation',
    parameter: 'Parameter',
    provinces: 'Provinces',
    post: 'Post'
  };
  title = '';

  order;
  isVisibleOrder = false;
  isVisibleEditOrder = false;

  constructor(
    protected adminService: AdminService,
    protected service: AdminService,
    protected router: Router,
    public translate: TranslateService,
    protected authService: AuthService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected serviceOrder: OrderService,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
    this.subUser = this.authService.user.subscribe(v => {
      this.user = v;
    });
    this.subCart = this.adminService.cart$.subscribe(v => this.cart = v);
    this.subCollapsed = this.adminService.collapsed$.subscribe(v => this.isCollapsed = v);
    this.subDrawer = this.adminService.drawer$.subscribe(v => this.isDrawer = v);
    this.subDesktop = this.adminService.desktop$.subscribe(v => this.isDesktop = v);
    this.subIsVisibleOrder = this.adminService.isVisibleOrder$.subscribe(v => this.isVisibleOrder = v);
    this.subIsVisibleEditOrder = this.adminService.isVisibleEditOrder$.subscribe(v => this.isVisibleEditOrder = v);
    this.subOrder = this.adminService.order$.subscribe(v => this.order = v);
    this.subLink = this.adminService.link$.subscribe(v => {
      if (v) {
        this.link = v.toString();
        this.translate
          .get('titles.' + this.links[v])
          .subscribe((res) => {
            this.title = res;
            document.getElementById('header_title').innerHTML = res;
            document.title = res;
          });
      }
    });
  }


  ngOnDestroy(): void {
    this.subUser.unsubscribe();
    this.subCart.unsubscribe();
    this.subCollapsed.unsubscribe();
    this.subDrawer.unsubscribe();
    this.subDesktop.unsubscribe();
    this.subLink.unsubscribe();
    this.subIsVisibleOrder.unsubscribe();
    this.subIsVisibleEditOrder.unsubscribe();
    this.subOrder.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.adminService.desktop$.next(event.currentTarget.innerWidth > 767);
  }

  toggle(): void{
    if (this.isDesktop) {
      this.adminService.collapsed$.next(!this.isCollapsed);
      this.adminService.drawer$.next(false);
    } else {
      this.adminService.drawer$.next(!this.isDrawer);
      this.adminService.collapsed$.next(false);
    }
  }

  loadData(visible: boolean): void {
    // if (visible) {
    //   this.loading = true;
    //   setTimeout(() => this.loading = false, 500);
    // }
  }

  openProfile(): void {
    this.visibleProfile = true;
    this.loadData(true);
  }

  changeLanguage(value: string): void {
    localStorage.setItem('ng-language', value);
    this.translate.setDefaultLang(value);
  }

  closeProfile(): void {
    this.visibleProfile = false;
  }

  onLogout(): void {
    this.authService.logout();
  }
  formatDate(date: any, format = 'HH:mm DD/MM/YY'): string {
    return date ? moment(date).format(format) : '';
  }

  handleDeleteProduct(index): void {
    this.cart.splice(index, 1);
    localStorage.setItem(environment.cart, JSON.stringify(this.cart));
    this.adminService.cart$.next(this.cart);
  }
  // -------------------------------------------------------------------------------------------------------------------
  handleCancelEditOrder(): void {
    this.adminService.isVisibleEditOrder$.next(false);
  }

  handleDetailOrder(item): void {
    this.adminService.isVisibleOrder$.next(true);
    this.adminService.order$.next(item);
  }

  handleCancelOrder(): void {
    this.adminService.isVisibleOrder$.next(false);
  }
  handleChangeStatusOrder(status: string): void {
    this.isLoading = true;
    switch (status) {
      case 'EDIT':
        return this.serviceOrder.getDetail(this.order.id).subscribe((res) => {
          this.adminService.order$.next(res.data);
          this.adminService.isVisibleEditOrder$.next(true);
          this.isLoading = false;
        });
      case 'REORDER':
        return this.serviceOrder
          .updateReorder(this.order.orderNo)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe((res) => {
            if (res.message) {
              this.message.success(res.message);
            }
            this.onChange(null);
          });
      default:
        return this.serviceOrder.changeStatus(this.order.id, status)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(res => {
            if (res.message) {
              this.message.success(res.message);
            }
            this.handleCancelOrder();
            this.onChange(null);
          });
    }
  }

}
