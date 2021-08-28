import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'room', children: [{ path: '', loadChildren: () => import('./room/room.module').then(m => m.RoomModule) }] },
      { path: 'charge', children: [{ path: '', loadChildren: () => import('./charge/charge.module').then(m => m.ChargeModule) }] },

      /*
          { path: 'marker',
            children: [
              { path: '',loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)}
            ]
          },*/
      { path: '', redirectTo: 'room', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
