import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { ApiService } from '../../../../service/api.service';
import { UiService } from '../../../../service/ui.service';
import { DayConfig } from 'ion2-calendar';
import { UserService } from '../../../../service/user.service';
import { User, USER, Prop, PROP, Room, ROOM } from '../../../../class';
import { PROPS } from '../../../../config';
import { UnitComponent } from '../unit/unit.component';
import { Unit } from '../unit/class';
import { CalendarService } from '../calendar.service';
@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit, OnDestroy {
  @ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;
  @ViewChild('reserve', { read: ElementRef, static: false }) reserve: ElementRef;
  @ViewChild('_story', { read: ElementRef, static: false }) story: ElementRef;
  @ViewChild('_chat', { read: ElementRef, static: false }) chat: ElementRef;
  user: User = USER;
  prop: Prop = PROP;
  room: Room = ROOM;
  unit: Unit = new Unit();
  unitStr: any = {};
  sizeStr = "";
  book = { from: null, to: null, amount: 0, aday: null }//{ room: null, prop: null, user: null, na: "", avatar: null, amount: 0, size: 0, from: null, to: null };
  title = "";
  method = "hold";//予約方法
  param = { id: null, na: "", txt: "", img: "", cursor: null };
  editable = false;
  isStory: boolean;
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private router: Router, private modal: ModalController, private ui: UiService,
    private userService: UserService, private api: ApiService, public calendarService: CalendarService,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {//this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.calendarService.load(params.prop).then(async room => {
        if (room[params.room]) {
          this.room = room[params.room];
          this.title = this.room.na;
          this.prop = PROPS.filter(prop => { return prop.id === this.room.prop; })[0];
          this.param = { id: this.room.id, na: `「${this.room.na}」を予約`, txt: this.room.txt, img: this.room.img, cursor: null };
          const now = new Date().setHours(0, 0, 0, 0);
          const from = params.from && new Date(params.from).getTime() > now ? params.from : new Date();
          const to = params.to && new Date(params.to).getTime() > new Date(from).getTime() ? params.to : from;
          this.book = { from: new Date(new Date(from).setHours(0, 0, 0, 0)), to: new Date(new Date(to).setHours(0, 0, 0, 0)), amount: 0, aday: null };
          this.calendarService.unit.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(unit => {
            if (unit.items.length) {
              this.unit = unit;
              this.unitStr = unit.toString(room.std.charge);
              this.sizeStr = unit.size(room.std.charge).toString();              
            } else {
              this.calendarService.unit.next(new Unit([1, 1, 2]));
            }
            this.calc();
          })          //this.unitService.unit.next(new Unit(this.prop.unitInis));    
          this.calendarService.book.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(res => {
            console.log('fire book.page!');
            if (this.room.id === res.room) { this.calc() }
          })
        } else {
          this.ui.alert('roomデータがありません。');
          this.param = { id: null, na: "", txt: "", img: "", cursor: null }
        }
      }).catch(err => {
        this.ui.alert(`roomデータの読み込みに失敗しました。\r\n${err.message}`);
      })
    });
    this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      this.user = user;
      this.editable = true;//PROPS.filter(prop => { return prop.id === room.prop })[0].users.filter(user => { return user === this.user.id; }).length === 1 || this.user.admin ? true : false;
    });
  }
  calc() {
    const room = this.calendarService.calc(this.room, this.unit, this.book.from, this.book.to);
    this.book.amount = room.amount;
    if (room.pop) this.ui.pop(room.pop);
  }
  openCalendar() {
    let days: DayConfig[] = []; const status = { close: "休止", full: "満室", over: "満員", aday: "日帰不可", short: "在庫不足", min: "下限未満", max: "上限超過" };
    Object.keys(this.room.day).forEach(d => {
      let subTitle: string;
      let closes = this.unit.closes(this.room.day[d].charge)
      if (closes.length) {
        let str = "";
        for (let item of closes) {
          str += `${this.room.day[d].std.charge[item].na}、`;
        }
        subTitle = `${str.slice(0, -1)}×`;
      } else if (this.room.day[d].status) {
        subTitle = status[this.room.day[d].status];
      } else {
        subTitle = new Intl.NumberFormat().format(Math.floor((this.room.day[d].price + this.unit.amount(this.room.day[d].charge)) * this.room.day[d].rate / 100));
      }
      days.push({ date: new Date(d), subTitle: subTitle, cssClass: this.room.day[d].css, disable: this.room.day[d].status ? true : false })
    })
    this.calendarService.open(days, [this.book.from, this.book.to]).then(res => {
      if (res) {
        this.book.from = res.from; this.book.to = res.to;
        this.calc();
      }
    })
  }
  async openUnit() {
    let modal = await this.modal.create({
      component: UnitComponent,
      componentProps: { unit: this.unit, user: this.user, charge: this.room.charge }
    });
    modal.present();
    modal.onDidDismiss().then(event => {
      if (event.data) {
        this.calendarService.unit.next(event.data);
      }
    });
  }
  pay(token) {
    let item: any = {}; let unit: any = {};
    const unitString = this.unit.toStringAll(this.room.charge);
    for (let d = new Date(this.book.from); d <= this.book.to; d.setDate(d.getDate() + 1)) {
      item[this.dateFormat(d)] = this.unit.items;
      unit[this.dateFormat(d)] = unitString;
    }
    this.api.post('book', {
      uid: this.user.id, na: this.user.na, avatar: this.user.avatar, prop: this.prop.id, room: this.room.id, token: token,
      amount: this.book.amount, from: this.dateFormat(this.book.from), to: this.dateFormat(this.book.to),
      unit: JSON.stringify(unit), item: JSON.stringify(item),
    }, '予約中').then(res => {
      this.calendarService.booking(this.user, { room: this.room.id, from: new Date(this.book.from).getTime(), to: new Date(this.book.to).getTime(), qty: 1, dated: new Date(res.booked).getTime(), item: item });
      this.ui.alert(`予約しました。`);
      this.router.navigate([`reserve`]);
    }).catch(err => {
      this.ui.alert(`予約手続きに失敗しました。`);
    });
  }
  night(from: Date, to: Date): number {//宿泊数の計算
    return Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'    
    var y = date.getFullYear();
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    var d = ("0" + date.getDate()).slice(-2);
    return y + "-" + m + "-" + d;//+ " " + h + ":" + min + ":" + sec;
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
/*



async onScrollEnd() {
    const content = await this.content.nativeElement.getScrollElement();
    this.currentY = content.scrollTop;
    this.contentH = content.offsetHeight;
    this.scrollH = content.scrollHeight;
    this.essayY = this.essay.nativeElement.offsetTop;
    this.chatY = this.chat ? this.chat.nativeElement.offsetTop : 0;
    this.reserveY = this.user.id ? this.reserve.nativeElement.offsetTop : 0;
    //console.log(`currentY:${this.currentY} scrollH:${this.scrollH} chatY:${this.chatY}`);
  }
  scroll(target) {
    this.content.nativeElement.scrollToPoint(0, target, 500);
  }



*/
/*
   for (let d = new Date(this.book.from); d <= this.book.to; d.setDate(d.getDate() + 1)) {
     let date = this.dateFormat(d);
     if (this.room.day[date].status) {
       this.book.amount = null;
       this.ui.pop(`${date}は「${this.status[this.room.day[date].status]}」のため選択できません。`);
       break;
     } else {
       const items = this.unit.closes(this.room.day[date].charge);
       if (items.length) {
         this.book.amount = null;
         let str = "";
         for (let item of items) {
           str += `${UNITITEM[item].na}、`;
         }
         this.ui.pop(`${date}の${str.slice(0, -1)}は予約を中止しています。`);
         break;
       } else if (this.room.day[date].book.size + this.unit.size(this.room.day[date].charge) > this.room.day[date].size) {
         this.book.amount = null;
         this.ui.pop(`${date}は満員のため選択できません。`);
         break;
       } else {
         this.book.amount += Math.floor((this.room.day[date].price + this.unit.amount(this.room.day[date].charge)) * this.room.day[date].rate / 100);
       }
     }
   }*/