import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {NzInputModule} from 'ng-zorro-antd/input';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { DatatableComponent } from './datatable.component';

@NgModule({
  declarations: [
    DatatableComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
          return new TranslateHttpLoader(http, '/assets/translations/');
        },
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    NzTableModule,
    NzDropDownModule,
    NzInputModule,
    NzCheckboxModule,
    NzRadioModule,
    NzButtonModule,
    NzDatePickerModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzBadgeModule,
    NzGridModule,
    NzPopoverModule,
    NzPaginationModule,
    NzSpinModule,
  ],
  exports: [
    DatatableComponent,
  ]
})
export class GeneatDatatableModule { }
