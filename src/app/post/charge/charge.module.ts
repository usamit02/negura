import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChargePage } from './charge.page';
import { SafePipe } from './safe.pipe';
import { SharedModule } from '../component/shared.module';
import { PlanModule } from './plan/plan.module';
const routes: Routes = [
  { path: ':prop/:room/:id', component: ChargePage },
];

@NgModule({
  imports: [
    CommonModule, IonicModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes), SharedModule, PlanModule
  ],
  declarations: [ChargePage, SafePipe,]
})
export class ChargeModule { }
