import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ChatComponent } from './chat.component';
import { ReactComponent } from './react/react.component';
import { SendComponent } from '../send/send.component';
import { EmojiComponent } from '../send/emoji/emoji.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { AngularResizedEventModule } from 'angular-resize-event';
import { SafePipe } from './pipe/safe.pipe';
import { DatePipe } from './pipe/date.pipe';
import { MediaPipe } from './pipe/media.pipe';
@NgModule({
  imports: [CommonModule, IonicModule, PickerModule,AngularResizedEventModule,],
  declarations: [ChatComponent, ReactComponent, SendComponent, EmojiComponent, SafePipe, DatePipe, MediaPipe,],
  entryComponents: [ReactComponent, EmojiComponent,],
  exports: [ChatComponent, ReactComponent, SendComponent, EmojiComponent,SafePipe,]
})
export class ChatSharedModule { }