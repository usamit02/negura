import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children:[
      { path: 'column', loadChildren: () => import('./page/column/column.module').then(m => m.ColumnPageModule) },
      { path: 'direct', loadChildren: () => import('./page/direct/direct.module').then(m => m.DirectPageModule) },
 
      { path: 'login', loadChildren: () => import('./page/login/login.module').then(m => m.LoginPageModule) },
      { path: 'regist', loadChildren: () => import('./page/regist/regist.module').then(m => m.RegistPageModule) },
      { path: 'columns', loadChildren: () => import('./page/columns/columns.module').then(m => m.ColumnsPageModule) },
      
      // { path: 'book', loadChildren: () => import('./page/book/book.module').then(m => m.BookPageModule) },
      { path: '', loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
