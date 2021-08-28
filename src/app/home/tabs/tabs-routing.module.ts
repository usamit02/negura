import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'facility',
        children: [{ path: '',loadChildren: () => import('./facility/facility.module').then(m => m.FacilityPageModule)}]
      },
      { path: 'reserve',
        children: [{path: '',loadChildren: () =>import('./reserve/reserve.module').then(m => m.ReservePageModule)}]
      },/*
      { path: 'marker',
        children: [
          { path: '',loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)}
        ]
      },*/
      { path: '', redirectTo: 'reserve', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
