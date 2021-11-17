import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {

  constructor(
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
  }

  changeLanguage(value: string): void {
    localStorage.setItem('ng-language', value);
    this.translate.setDefaultLang(value);
  }
}
