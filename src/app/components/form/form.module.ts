import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { FormComponent } from './form.component';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

@NgModule({
  declarations: [
    FormComponent,
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
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCheckboxModule,
        NzSelectModule,
        NzRadioModule,
        NzDatePickerModule,
        NzTypographyModule,
        NzInputNumberModule,
        NzDividerModule,
        NzSpinModule,
        NzAutocompleteModule,
        NzUploadModule,
        NgxMaskModule.forRoot(),
        NzSwitchModule,
    ],
  exports: [
    FormComponent,
  ]
})
export class GeneatFormModule { }
