import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'post/report', loadChildren: () => import('./post/report/report.module').then(m => m.ReportModule) },
  { path: 'post/column', loadChildren: () => import('./post/column/column.module').then(m => m.ColumnModule) },
  //{ path: 'post/charge', loadChildren: () => import('./post/charge/charge.module').then(m => m.ChargeModule) },
  { path: 'post', loadChildren: () => import('./post/home/home.module').then(m => m.HomePageModule) },

  // { path: 'post/blog', loadChildren: () => import('./post/blog/blog.module').then(m => m.BlogModule) },
// { path: 'manage/book', loadChildren: () => import('./manage/book/book.module').then(m => m.BookModule) }, 
  {path: '',loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)},  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
