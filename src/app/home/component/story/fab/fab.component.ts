import { Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, SimpleChanges, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { ScrollEndService } from '../../../../service/scroll.service';
@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss'],
})
export class FabComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() content: IonContent;
  @Input() story: ElementRef;
  @Input() chat: ElementRef;
  @Input() uid: string;
  @Input() author: string;
  @Input() page: string;
  @Input() id: number;
  @Input() na: string;
  @Input() isStory: boolean;
  currentY: number; contentH: number; scrollH: number; storyY = 0; chatY = 0;
  pos= { y: 0, h: 0, H: 0, story: 0, chat: 0 };
  eval: string = null;
  private onDestroy$ = new Subject();
  constructor(private store: AngularFirestore, private scrollEnd: ScrollEndService,) { }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {    
    if (changes.uid && this.uid) {
      this.store.doc(`${this.page}/${this.id}/eval/${this.uid}`).get().toPromise().then((snap: any) => {
        this.eval = snap.exists ? snap.data().id : null;
      });
    }
  }
  ngAfterViewInit() {    
    this.scrollEnd.$.pipe(takeUntil(this.onDestroy$)).subscribe((state: any) => {
      state.story = this.story ? this.story.nativeElement.offsetTop : null;
      state.chat = this.chat ? this.chat.nativeElement.offsetTop : null;
      this.pos = state;//console.log(`scrollEnd y:`,state.y,' h:',state.h,' H:',state.H, ' chat:',state.chat , ' story:',state.story);
    })
    this.scrollEnd.set(this.content, this.onDestroy$);
  }  
  scroll(target) {
    this.content.scrollToPoint(0, target, 500);
  }
  evaluation(val) {
    this.store.doc(`${this.page}/${this.id}/eval/${this.uid}`).set({ id: val, uid: this.author, na: this.na, upd: new Date() }).then(() => {
      this.eval = val;
    }).catch(err => {
      alert(`評価の書き込みに失敗しました\r\n${err.message}`);
    });
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
