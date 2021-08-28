import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { ChargeComponent } from './charge.component';
import { YenPipe } from './yen.pipe';
const routes: Routes = [  
  { path: '', component: ChargeComponent },
];
@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes),IonicModule, FormsModule,ReactiveFormsModule],
  declarations: [ChargeComponent,YenPipe],
})
export class ChargeModule { }