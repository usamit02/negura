import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ColumnPage } from './column.page';
import { StorySharedModule } from '../../component/story/shared.module';
import { HideHeaderSharedModule } from '../../../directive/hideheadershared.module';
//import { ThreadPage } from '../../page/thread/thread.page';
const routes: Routes = [
  { path: ':id', component: ColumnPage },
  { path: ':id/:cursor', component: ColumnPage },
  //{ path: 'report/thread/:id/:thread', component: ReportPage },
  //{ path: 'report/thread/:id/:thread/:cursor', component: ReportPage },
];
@NgModule({
  imports: [
    CommonModule, IonicModule, RouterModule.forChild(routes), StorySharedModule, HideHeaderSharedModule,
  ],
  declarations: [ColumnPage],
})
export class ColumnPageModule { }
