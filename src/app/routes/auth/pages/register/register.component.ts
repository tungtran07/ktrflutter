import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {finalize} from 'rxjs/operators';

import {NzMessageService} from 'ng-zorro-antd/message';

import { AuthService } from '@routes/auth/auth.service';
import {OrderService} from '@routes/admin/pages/order/order.service';

import {columns} from './register.column';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [AuthService, OrderService],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit{
  isLoading = true;
  langPrefix = 'routes.Auth.Register';

  listCommune = [];
  listProvince = [];
  listDistrict = [];
  columns = columns(this);

  constructor(
    private router: Router,
    public translate: TranslateService,
    private authService: AuthService,
    private message: NzMessageService,
    protected service: OrderService,
  ) {
  }

  ngOnInit() {
    this.service.getProvince().subscribe(res => {
      res.data.map(item => this.listProvince.push({value: item.maTinh, label: item.tenTinh}))
      this.columns = columns(this);
      this.isLoading = false;
    })
  }

  submitForm(validateForm): void {
    if (validateForm.status === 'VALID') {
      this.isLoading = true;
      this.authService
        .signUp(validateForm.value)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(
          res => {
            this.router.navigate(['/auth']);
          }
        );
    }
  }
}
