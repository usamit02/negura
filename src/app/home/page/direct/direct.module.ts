
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DirectPage } from './direct.page';
import { ChatSharedModule } from '../../component/chat/shared.module';
import { HideHeaderSharedModule } from '../../../directive/hideheadershared.module';
import { FabSharedModule } from '../../component/send/fab/shared.module';
//import { ThreadPage } from '../../page/thread/thread.page';
const routes: Routes = [
  { path: ':id', component: DirectPage },
  { path: ':id/:cursor', component: DirectPage },
  { path: '', component: DirectPage },
];
@NgModule({
  imports: [
    CommonModule, IonicModule, RouterModule.forChild(routes), ChatSharedModule, HideHeaderSharedModule, FabSharedModule,
  ],
  declarations: [DirectPage,],
  entryComponents: [],
})
export class DirectPageModule { }
