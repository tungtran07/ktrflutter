import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSelectModule} from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageModule } from 'ng-zorro-antd/message';

import {GeneatModalModule} from '@components/modal/modal.module';
import {GeneatFormModule} from '@components/form/form.module';

import { AuthRouting } from './auth.routing';
import { AuthComponent } from './auth.component';
import { RegisterComponent } from './pages/register/register.component';
import {LoginComponent} from './pages/login/login.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    AuthRouting,
    HttpClientModule,
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
    GeneatModalModule,
    GeneatFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzSelectModule,
    NzMessageModule,
    NzAvatarModule,
  ]
})
export class AuthModule { }
