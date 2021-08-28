import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children:[
      
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
