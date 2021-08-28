import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HideHeaderTabDirective } from './hideheadertab.directive';
@NgModule({
  imports: [CommonModule, IonicModule,],
  declarations: [HideHeaderTabDirective],
  exports: [HideHeaderTabDirective,]
})
export class HideHeaderTabSharedModule { }