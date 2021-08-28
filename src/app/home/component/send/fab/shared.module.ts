import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FabComponent } from './fab.component';
@NgModule({
  imports: [CommonModule, IonicModule,],
  declarations: [FabComponent],
  exports: [FabComponent]
})
export class FabSharedModule { }