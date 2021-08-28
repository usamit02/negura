import { NgModule } from '@angular/core';
import { DatePipe } from "./date.pipe";
@NgModule({
  imports: [],
  declarations: [DatePipe,],
  exports: [DatePipe]
})
export class SharedModule { }