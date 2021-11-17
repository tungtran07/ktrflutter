import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

import { AdminService } from '@routes/admin/admin.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MainComponent implements OnInit, OnDestroy {
  isCollapsed: boolean;
  isDrawer: boolean;
  isDesktop = window.innerWidth > 767;

  constructor(
    private layoutService: AdminService
  ) { }

  ngOnInit(): void {
    this.layoutService.collapsed$.subscribe(v => this.isCollapsed = v);
    this.layoutService.drawer$.subscribe(v => this.isDrawer = v);
    this.layoutService.desktop$.subscribe(v => this.isDesktop = v);
    window.addEventListener('resize', this.handleResize);
    setTimeout(() => {
      const info = new PerfectScrollbar('#main_content');
    }, 1000);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize(): void {
    this.isDesktop = window.innerWidth > 767;
  }

  closeSideBar(): void {
    this.layoutService.drawer$.next(false);
  }
}
