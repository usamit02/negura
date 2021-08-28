import { Component, OnInit, OnChanges, Input, ViewChild, SimpleChanges, OnDestroy } from '@angular/core';
import { IonInfiniteScroll, PopoverController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from './../../../../service/state.service';
import { Prop,User } from '../../../../class';
@Component({
  selector: 'app-talks',
  templateUrl: './talks.component.html',
  styleUrls: ['./talks.component.scss'],
})
export class TalksComponent implements OnInit, OnChanges, OnDestroy {
  @Input() prop:Prop;
  @Input() user:User;
  @ViewChild('infinite', { static: false }) infinite: IonInfiniteScroll;
  talks = [];
  private onDestroy$ = new Subject();
  constructor(private pop: PopoverController, private store: AngularFirestore, private state: StateService,) { }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.prop && this.state.get('isServer') === false) {
      console.log(`talk prop changes:${this.prop}`);
      let store = this.store.collection('talk', ref => {
        if (this.prop.id > 0) ref.where('prop', "==", this.prop.id);
        return ref.where('upd', "<", new Date()).orderBy('upd', 'desc');
        /*
        if (this.prop > 0) {
          return ref.where('prop', "==", this.prop).where('upd', "<", new Date()).orderBy('upd', 'desc');
        } else {
          return ref.where('upd', "<", new Date()).orderBy('upd', 'desc');
        }*/
      });
      store.stateChanges(['added']).pipe(takeUntil(this.onDestroy$)).subscribe(action => {//トークロード以降の書き込み
        if (action.length) {
          this.talks.unshift(action[0].payload.doc.data());
        }
      });
      this.talkLoad(false);
    }
  }
  async talkLoad(event) {//コンポーネントロード時及び無限スクロール下端イベント発生時発火
    let docs = [];
    let store = this.store.collection('talk', ref => {
      if (this.talks.length) ref.where('upd', "<", this.talks[this.talks.length - 1].upd);
      if (this.prop.id > 0) ref.where('prop', "==", this.prop.id);
      return ref.orderBy('upd', 'desc').limit(20);
    });
    store.get().toPromise().then(query => {
      query.forEach(doc => {
        docs.unshift(doc.data());
      })
    })
    if (event) event.target.complete();
    if (docs.length) {
      this.talks.push(...docs);
    } else if (this.infinite) {
      this.infinite.disabled = true;
    }
  }
  async popUser(event, uid) {/*
    const popover = await this.pop.create({
      component: UserComponent,
      componentProps: { id: uid, self: this.user },
      cssClass: 'user'
    });
    return await popover.present();*/
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
