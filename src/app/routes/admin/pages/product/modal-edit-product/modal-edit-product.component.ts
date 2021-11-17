import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

import {NzMessageService} from 'ng-zorro-antd/message';

import {BaseComponent} from '@components/base-component';
import {Auth} from '@routes/auth/auth.model';
import {AuthService} from '@routes/auth/auth.service';
import {AdminService} from '@routes/admin/admin.service';
import {environment} from '@src/environments/environment';
import {ProductService} from '@routes/admin/pages/product/product.service';
import { columns } from '../product.column';

@Component({
  selector: 'app-modal-edit-product',
  templateUrl: './modal-edit-product.component.html',
  styles: [
  ],
  encapsulation: ViewEncapsulation.None
})
export class ModalEditProductComponent extends BaseComponent  implements OnInit, OnDestroy, OnChanges {
  langPrefix = 'routes.Admin.Product';

  @Input() data;
  @Input() isVisible;
  @Input() listTypeProduct;
  @Input() linkProduct = true;

  @Output() cancelModal: EventEmitter<any> = new EventEmitter();
  @Output() changeModal: EventEmitter<any> = new EventEmitter();
  @Output() showProductLink: EventEmitter<any> = new EventEmitter();
  @ViewChild('tableProduct') tableProduct;

  user: Auth;

  isVisibleEdit = false;
  listSizes = [];
  imageUrl?: string;
  newSizes = {size: '', quantity: 0};
  storageLinkedItemId;
  listProduct = [];

  constructor(
    protected service: ProductService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    protected authService: AuthService,
    protected translate: TranslateService,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  customReq = (item) => {
    this.isLoading = true;
    return this.service.uploadFileBlobPhysical(item.file).subscribe(
      response => {
        if (response.code === 200) {
          this.isLoading = false;
          this.imageUrl =  environment.adminApiUrl + '/StaticFiles/' + response.data.physicalPath;
        }
      },
      error => {
        console.error(error);
      },
    );
  }
  onPaste(event): void {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const index in items) {
      if (items.hasOwnProperty(index)) {
        const item = items[index];
        if (item.kind === 'file') {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (e: any) => {};
          this.customReq({
            file: new File([blob], 'product.jpg') as any
          });
        }
      }
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible) {
      if (changes.isVisible.currentValue) {
        if (this.data) {
          this.isLoading = true;
          if (this.data.storageLinkedItemId) {
            this.storageLinkedItemId = this.data.storageLinkedItemId;
            this.service.getListProduct({
              page: 1,
              size: 10,
              filter: JSON.stringify({fullTextSearch: '', id: this.data.storageLinkedItemId})
            }).subscribe((res) => {
              res.data.content.map(itemProduct => this.listProduct.push({
                ...itemProduct,
                value: itemProduct.id,
                label: itemProduct.name
              }));
            });
          } else {
            this.storageLinkedItemId = null;
          }

          this.service.getById(this.data.id).subscribe(({data}) => {
            this.imageUrl = data.imageUrl;
            this.listSizes = data.sizeWithQuantity;
            this.listSizes = [];
            for (let i = 0; i <= 10; i++) {
              const size = (35 + i).toString();
              const checkQuantity = data.sizeWithQuantity.filter(product => product.size === size);
              this.listSizes.push({
                size,
                quantity: checkQuantity.length > 0 ? checkQuantity[0].quantity : 0
              });
            }
            this.data = data;
            this.listOfColumns = columns(this);
            this.isVisibleEdit = true;
            this.isLoading = false;
          });
        } else {
          this.storageLinkedItemId = null;
          this.imageUrl = null;
          this.listSizes = [];
          for (let i = 0; i <= 10; i++) {
            this.listSizes.push({
              size: (35 + i).toString(),
              quantity: 0,
            });
          }
          this.listOfColumns = columns(this);
          this.isVisibleEdit = true;
          this.isLoading = false;
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
    this.isLoading = false;
    this.cancelModal.emit();
  }

  handleOk(validateForm): any {
    if (!this.storageLinkedItemId && this.listSizes.filter(item => item.quantity > 0).length === 0) {
      this.message.warning('Vui lòng nhập size và số lượng cho sản phẩm');
    } else {
      if (!!this.storageLinkedItemId) {
        validateForm.value.sizeWithQuantity = null;
        validateForm.value.sizeInString = '';
        validateForm.value.size = '';
        validateForm.value.storageLinkedItemId = this.storageLinkedItemId;
      } else {
        const sizeInString = [];
        validateForm.value.sizeWithQuantity = [];
        this.listSizes.map(item => {
          if (item.quantity > 0) {
            sizeInString.push(item.size);
            validateForm.value.sizeWithQuantity.push(item);
          }
        });
        validateForm.value.sizeInString = sizeInString.join(',');
      }
      validateForm.value.imageUrl = this.imageUrl;
      super.handleOk(validateForm);
    }
  }
  success(message): void {
    this.isVisibleEdit = false;
    this.handleCancel();
    this.changeModal.emit(message);
  }
  handleAddSize(): void {
    this.listSizes.push(this.newSizes);
    this.newSizes = {size: '', quantity: 0};
  }

  handleShowLinkProduct(id): void {
    this.showProductLink.emit({id});
  }
}
