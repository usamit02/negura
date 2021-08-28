import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BookPage } from './book.page';
import { HoldSharedModule } from '../hold/shared.module';
import { PaySharedModule } from '../../../component/pay1/shared.module';
import { StorySharedModule } from '../../../component/story/shared.module';
import { ChatSharedModule } from '../../../component/chat/shared.module';
import { HideHeaderTabSharedModule } from '../../../../directive/hideheadertabshared.module';
import { SharedModule } from '../shared.module';
const routes: Routes = [
  //{ path: ':prop/:room/:from/:to', component: BookPage },
  { path: '', component: BookPage },
];
@NgModule({
  imports: [
    CommonModule, IonicModule, RouterModule.forChild(routes),FormsModule,
    PaySharedModule, StorySharedModule, ChatSharedModule, HideHeaderTabSharedModule,SharedModule,HoldSharedModule,
  ],
  declarations: [BookPage],
})
export class BookPageModule { }
