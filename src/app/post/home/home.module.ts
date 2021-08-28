import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomeService } from './home.service';
import { HomePageRoutingModule } from './home-routing.module';

import { MenuComponent } from './component/menu/menu.component';
import { ChargesComponent } from './component/charges/charges.component';

@NgModule({
  imports: [
    CommonModule, FormsModule, IonicModule, HomePageRoutingModule,
  ],
  declarations: [HomePage, MenuComponent, ChargesComponent,],
  providers: [HomeService]
})
export class HomePageModule { }
