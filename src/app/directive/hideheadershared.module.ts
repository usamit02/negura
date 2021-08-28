import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HideHeaderDirective } from './hideheader.directive';
@NgModule({
  imports: [CommonModule, IonicModule,],
  declarations: [HideHeaderDirective],
  exports: [HideHeaderDirective,]
})
export class HideHeaderSharedModule { }