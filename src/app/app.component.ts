import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {AuthService} from '@routes/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit{
  title = 'routing-app';
  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
