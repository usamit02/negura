import { Component, OnInit,OnDestroy, AfterViewInit, Input, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollEndService } from '../../../service/scroll.service';
@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss'],
})
export class FabComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() content: IonContent;
  currentY: number; contentH: number; scrollH: number;
  pos= { y: 0, h: 0, H: 0};
  private onDestroy$ = new Subject();
  constructor(private scrollEnd: ScrollEndService,) { }
  ngOnInit() {}

  ngAfterViewInit() {    
    this.scrollEnd.$.pipe(takeUntil(this.onDestroy$)).subscribe((state: any) => {
      this.pos = state;//console.log(`scrollEnd y:`,state.y,' h:',state.h,' H:',state.H, ' chat:',state.chat , ' story:',state.story);
    })
    this.scrollEnd.set(this.content, this.onDestroy$);
  }  
  scroll(target) {
    this.content.scrollToPoint(0, target, 500);
  } 
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
