import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

import { MenuComponent } from './component/menu/menu.component';
import { ColumnComponent } from './component/menu/column/column.component';
import { TalksComponent } from './component/talks/talks.component';
import { UserComponent } from './component/user/user.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule, HomePageRoutingModule,
  ],
  declarations: [HomePage, MenuComponent, ColumnComponent, TalksComponent, UserComponent], 
})
export class HomePageModule { }
