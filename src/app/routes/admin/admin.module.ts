import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { NgxMaskModule } from 'ngx-mask';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import {NzSelectModule} from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzIconModule } from 'ng-zorro-antd/icon';

import {GeneatDatatableModule} from '@components/datatable/datatable.module';
import {GeneatModalFormModule} from '@components/modal-form/modal-form.module';
import {GeneatModalModule} from '@components/modal/modal.module';
import {GeneatFormModule} from '@components/form/form.module';

import { MainComponent } from './components/main/main.component';
import { AdminRouting } from './admin.routing';
import { AdminComponent } from './admin.component';
import { SideComponent } from './components/side/side.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { OrderComponent } from './pages/order/order.component';
import { ProductComponent } from './pages/product/product.component';
import { ModalDetailOrderComponent } from './pages/order/modal-detail-order/modal-detail-order.component';
import { ModalPrintOrderComponent } from './pages/order/modal-print-order/modal-print-order.component';
import { ModalEditOrderComponent } from './pages/order/modal-edit-order/modal-edit-order.component';
import { ModalPrintBarcodeComponent } from './pages/product/modal-print-barcode/modal-print-barcode.component';
import { ModalEditProductComponent } from './pages/product/modal-edit-product/modal-edit-product.component';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PostComponent } from './pages/post/post.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { CopyClipboardDirective } from '@routes/admin/pages/post/copy-clipboard.directive';

@NgModule({
  declarations: [
    AdminComponent,
    MainComponent,
    SideComponent,
    HeaderComponent,
    FooterComponent,
    OrderComponent,
    ProductComponent,
    ModalDetailOrderComponent,
    ModalPrintOrderComponent,
    ModalEditOrderComponent,
    ModalPrintBarcodeComponent,
    ModalEditProductComponent,
    PostComponent,
    CopyClipboardDirective
  ],
    imports: [
        CommonModule,
        AdminRouting,
        FormsModule,
        GeneatModalModule,
        GeneatDatatableModule,
        GeneatModalFormModule,
        GeneatFormModule,
        TranslateModule.forRoot({
            defaultLanguage: localStorage.getItem('ng-language') || 'vi',
            loader: {
                provide: TranslateLoader,
                useFactory: function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
                    return new TranslateHttpLoader(http, 'assets/translations/');
                },
                deps: [HttpClient]
            }
        }),
        NgxMaskModule,
        NzDatePickerModule,
        NzLayoutModule,
        NzBadgeModule,
        NzPopoverModule,
        NzTabsModule,
        NzListModule,
        NzButtonModule,
        NzSkeletonModule,
        NzDrawerModule,
        NzGridModule,
        NzDividerModule,
        NzSpinModule,
        NzBreadCrumbModule,
        NzAvatarModule,
        NzMenuModule,
        NzSelectModule,
        NzInputModule,
        NzSpaceModule,
        NzDescriptionsModule,
        NzInputNumberModule,
        NzUploadModule,
        NzRadioModule,
        NzToolTipModule,
        NzCardModule,
        NzTypographyModule,
        NzSwitchModule,
        NzAlertModule,
        NzCollapseModule,
        NzStepsModule,
        NzIconModule,
        NzTreeModule,
        NzTagModule,
        NzEmptyModule,
        NzFormModule,
        ReactiveFormsModule,
        NzTreeSelectModule,
        NzAutocompleteModule,
        NzTransferModule,
        ScrollingModule,
        NzDropDownModule,
        NzCheckboxModule,
        NzPaginationModule,
    ]
})
export class AdminModule { }
