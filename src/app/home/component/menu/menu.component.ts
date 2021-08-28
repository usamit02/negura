import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, ModalController, AlertController } from '@ionic/angular';
import { Subject, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { User, Column } from '../../../class';
import { ApiService } from './../../../service/api.service';
import { UiService } from './../../../service/ui.service';
import { StateService } from './../../../service/state.service';
import { UserComponent } from '../user/user.component';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: User;
  @Output() logout = new EventEmitter();
  @Output() close = new EventEmitter();
  mode: string;
  direct$: Observable<any>;
  mention$: Observable<any>;//mentions: Array<Mention> = [];
  post$: Observable<any>;
  private onDestroy$ = new Subject();
  constructor(private router: Router, private store: AngularFirestore, private db: AngularFireDatabase,
    private ui: UiService, private pop: PopoverController,) { }
  ngOnInit() {
  }
  ngOnChanges() {
    if (this.user.id) {
      this.direct$ = this.store.collection(`user/${this.user.id}/undirect`, ref => ref.orderBy('upd')).valueChanges();
      this.mention$ = this.store.collection(`user/${this.user.id}/unmention`, ref => ref.orderBy('upd')).valueChanges();
      if (this.user.admin) {
        this.post$ = this.db.list(`post`).valueChanges();
      } else {
        this.post$ = null;
      }
    } else {
      this.direct$ = null; this.mention$ = null; this.post$ = null;
    }
  }  
  link(url,modeKeep?:boolean){
    this.router.navigate([`/${url}`]);
    if(!modeKeep)this.mode="";
    this.close.emit();
  }
  menuClose(){
    this.close.emit();
  }
  direct(unread: number) {
    if (unread) {
      this.mode = this.mode === 'direct' ? '' : 'direct'
    } else {
      this.router.navigate(['/directs']);this.close.emit();
    }
  }
  delete(url: string, typ: string) {
    this.store.collection('user').doc(this.user.id).collection(`un${typ}`, ref => ref.where('url', '==', url)).get().toPromise().then(query => {
      query.forEach(doc => {
        this.store.collection('user').doc(this.user.id).collection(`un${typ}`).doc(doc.id).delete();
      });
    });
  }
  contact() {
    this.db.database.ref(`admin`).orderByValue().limitToLast(1).once('value').then(admin => {
      let a= admin.val();
      this.router.navigate([`/direct`], { queryParams: { user: Object.keys(admin.val())[0], self: this.user.id } });
      this.close.emit();
    }).catch(err => {
      this.ui.alert(`データベースの読込に失敗しました。\r\n${err.message}`);
    });
  }  
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
