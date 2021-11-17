import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AdminService} from './admin.service';

@Component({
  selector: 'app-layout',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.None,
})
export class AdminComponent implements OnInit {

  constructor(
    protected service: AdminService,
  ) { }

  ngOnInit(): void {

  }

}
