import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HoldComponent } from './hold.component';
@NgModule({
  imports: [CommonModule, IonicModule,],
  declarations: [HoldComponent],
  exports: [HoldComponent]
})
export class HoldSharedModule { }