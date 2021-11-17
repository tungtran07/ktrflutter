import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {finalize} from 'rxjs/operators';

import {NzMessageService} from 'ng-zorro-antd/message';

import {FormModel} from '@components/form/form.model';
import {AuthService} from '@routes/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class LoginComponent {
  isLoading: boolean;
  langPrefix = 'routes.Auth.Login';
  columns: FormModel[] = [
    {
      name: 'userName',
      title: this.langPrefix + '.loginName',
      formItem: {
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'password',
      title: this.langPrefix + '.password',
      formItem: {
        type: 'password',
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'remember',
      title: this.langPrefix + '.remember',
      formItem: {
        type: 'checkbox'
      }
    },
  ];

  isVisibleForgotPassword = false;
  phoneForgotPassword = '';

  constructor(
    private router: Router,
    public translate: TranslateService,
    private authService: AuthService,
    private message: NzMessageService,
  ) {}

  submitForm(validateForm): void {
    if (validateForm.status === 'VALID') {
      this.isLoading = true;
      this.authService
        .signIn(validateForm.value)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(res => this.router.navigate(['/admin']));
    }
  }

  handleShowForgotPassword(): void {
    this.isVisibleForgotPassword = true;
  }
  handleCancelForgotPassword(): void {
    this.isVisibleForgotPassword = false;
    this.phoneForgotPassword = '';
  }
  handleForgotPasswordAction(): void {
    if (this.phoneForgotPassword !== '') {
      this.isLoading = true;
      this.authService
        .forgotPass(this.phoneForgotPassword)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(res => this.handleCancelForgotPassword());
    }
  }

}
