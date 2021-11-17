import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalFormComponent } from './modal-form.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import { NzGridModule } from 'ng-zorro-antd/grid';

import {GeneatFormModule} from '@components/form/form.module';
import {GeneatModalModule} from '@components/modal/modal.module';

@NgModule({
  declarations: [
    ModalFormComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
          return new TranslateHttpLoader(http, '/assets/translations/');
        },
        deps: [HttpClient]
      }
    }),
    GeneatFormModule,
    GeneatModalModule,
    NzGridModule,
  ],
  exports: [
    ModalFormComponent,
  ]
})
export class GeneatModalFormModule { }
