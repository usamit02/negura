import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DetailPage } from './detail.page';
import { HoldSharedModule } from '../hold/shared.module';
import { PaySharedModule } from '../../../component/pay1/shared.module';
import { ChatSharedModule } from '../../../component/chat/shared.module';
import { FabSharedModule } from '../../../component/send/fab/shared.module';
import { HideHeaderTabSharedModule } from '../../../../directive/hideheadertabshared.module';
import { SharedModule } from '../shared.module';
const routes: Routes = [
  //{ path: ':prop/:room/:from/:to', component: BookPage },
  { path: '', component: DetailPage },
];
@NgModule({
  imports: [
    CommonModule, IonicModule, RouterModule.forChild(routes), FormsModule,
    HoldSharedModule, PaySharedModule, ChatSharedModule, FabSharedModule, HideHeaderTabSharedModule, SharedModule
  ],
  declarations: [DetailPage,],
})
export class DetailPageModule { }
