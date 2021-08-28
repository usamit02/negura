import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomPage } from './room.page';
import { SafePipe } from './safe.pipe';
import { SharedModule } from '../../../component/shared.module';
import { PlanModule } from './plan/plan.module';
import { OtaModule } from './ota/ota.module';
const routes: Routes = [
  { path: ':id/charge', loadChildren: () => import('./charge/charge.module').then(m => m.ChargeModule)  },
  { path: 'typ/:typ', component: RoomPage },
  { path: ':id', component: RoomPage },
];

@NgModule({
  imports: [
    CommonModule, IonicModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes), SharedModule, PlanModule, OtaModule,
  ],
  declarations: [RoomPage, SafePipe,]
})
export class RoomModule { }
