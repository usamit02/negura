import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservePage } from './reserve.page';
import { CancelModule } from './cancel/cancel.module';
import { UnitModule } from './unit/unit.module';
import { SharedModule } from './shared.module';
import { CalendarModule } from "../../../component/calendar";//"ion2-calendar";
import { CalendarService } from './calendar.service';
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild([
      { path: 'detail/:payjp', loadChildren: () => import('./detail/detail.module').then(m => m.DetailPageModule) }, 
      { path: ':prop/:room/:from/:to', loadChildren: () => import('./book/book.module').then(m => m.BookPageModule) },
      { path: ':prop/:room/:from', loadChildren: () => import('./book/book.module').then(m => m.BookPageModule) },
      { path: ':prop/:room', loadChildren: () => import('./book/book.module').then(m => m.BookPageModule) },
      { path: '', component: ReservePage },
    ]),
    CancelModule, UnitModule,CalendarModule.forRoot(),SharedModule
  ],
  declarations: [ReservePage],
  providers:[CalendarService] 
})
export class ReservePageModule { }
