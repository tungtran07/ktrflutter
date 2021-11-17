import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs';

import {AuthService} from '@routes/auth/auth.service';
import {Auth} from '@routes/auth/auth.model';
import { AdminService } from '@routes/admin/admin.service';

import { ListMenu } from './side.menu';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-side',
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SideComponent implements OnInit, OnDestroy {
  isCollapsed: boolean;
  menus;
  private subUser: Subscription;
  user: Auth;
  url;
  dataMenu;

  constructor(
    private layoutService: AdminService,
    private authService: AuthService,
    protected service: AdminService,
    protected adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.layoutService.collapsed$.subscribe(v => this.isCollapsed = v);

    this.subUser = this.authService.user.subscribe(user => {
      if (user) {
        this.user = user;
        this.adminService.link$.subscribe(url => {
          this.url = '/admin/' + url;
          this.handleFormatMenu();
        });
      }
    });
  }

  handleFormatMenu(): void {
    let _menus = JSON.parse(JSON.stringify(ListMenu));
    this.menus = _menus.map(item => {
      item.child = item.child.filter(subItem => subItem['level'] <= this.user.level);
      return item;
    });
  }

  ngOnDestroy(): void {
    this.subUser.unsubscribe();
  }
  handleOpenMenu(group): boolean {
    return group && group.filter(item => item.path === this.url).length > 0;
  }
}
