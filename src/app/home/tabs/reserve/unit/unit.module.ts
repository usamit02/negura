import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { UnitComponent } from './unit.component';
@NgModule({
  imports: [CommonModule, IonicModule, FormsModule,ReactiveFormsModule],
  declarations: [UnitComponent],
  exports: [UnitComponent]
})
export class UnitModule { }