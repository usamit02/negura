import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { OtaComponent } from './ota.component';
@NgModule({
  imports: [CommonModule, IonicModule, FormsModule,ReactiveFormsModule],
  declarations: [OtaComponent],
  exports: [OtaComponent]
})
export class OtaModule { }