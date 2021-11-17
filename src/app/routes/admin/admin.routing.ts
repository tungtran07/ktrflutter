import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {MainComponent} from './components/main/main.component';
import {OrderComponent} from './pages/order/order.component';
import {ProductComponent} from './pages/product/product.component';
import { PostComponent } from '@routes/admin/pages/post/post.component';
// import { NotFoundComponent } from '../error/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'product', pathMatch: 'full' },
      {
        path: 'order',
        component: OrderComponent
      },
      {
        path: 'product',
        component: ProductComponent
      },
      {
        path: 'post',
        component: PostComponent
      },
      // {
      //     path: '',
      //     redirectTo: 'Dashboard',
      //     pathMatch: 'full',
      // },
      // {
      //     path: '**',
      //     component: NotFoundComponent,
      // },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRouting {
}
