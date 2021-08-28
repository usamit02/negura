import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StoryComponent } from './story.component';
import { FabComponent } from './fab/fab.component';
import { SafePipe } from './safe.pipe';
import { DatePipe } from './date.pipe';
@NgModule({
  imports: [CommonModule, IonicModule,],
  declarations: [StoryComponent, FabComponent, SafePipe, DatePipe],
  exports: [StoryComponent, FabComponent, SafePipe, DatePipe]
})
export class StorySharedModule { }