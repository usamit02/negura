import { IonicModule } from '@ionic/angular';
import { Routes,RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FacilityPage } from './facility.page';
import { DatePipe } from './date.pipe';
import { SafePipe } from './safe.pipe';
import { StorySharedModule } from '../../component/story/shared.module';
import { ChatSharedModule } from '../../component/chat/shared.module';
import { HideHeaderTabSharedModule} from '../../../directive/hideheadertabshared.module';
const routes: Routes = [
  //{ path: ':id', component:FacilityPage },
  { path: '/:cursor', component: FacilityPage }, 
  { path: '', component: FacilityPage },
  //{ path: 'report/thread/:id/:thread', component: ReportPage },
  //{ path: 'report/thread/:id/:thread/:cursor', component: ReportPage },
];
@NgModule({
  imports: [
    IonicModule, CommonModule, FormsModule, ReactiveFormsModule,
    RouterModule.forChild(routes),StorySharedModule,ChatSharedModule,HideHeaderTabSharedModule,
  ],
  declarations: [FacilityPage,DatePipe,SafePipe,]
})
export class FacilityPageModule { }
