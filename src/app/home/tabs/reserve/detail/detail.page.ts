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
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit, OnDestroy {
  @ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;
  @ViewChild('_chat', { read: ElementRef, static: false }) chat: ElementRef;
  user: User = USER;
  prop: Prop = PROP;
  room: Room = ROOM;
  books = [];
  units: TermUnit[];
  unitStrs: any[] = [];
  book0 = BOOK;//{ room: null, prop: null, user: null, na: "", avatar: null, amount: 0, size: 0, from: null, to: null };
  book = BOOK;
  title = "";
  param = { id: null, na: "", txt: "", img: "", cursor: null };
  editable = false;
  isChange = false;
  isStory: boolean;
  private status = { close: "休止", full: "満室", over: "満員" };
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private router: Router, private modal: ModalController, private ui: UiService,
    private userService: UserService, private api: ApiService, private calendarService: CalendarService,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {//this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(async user => {
        this.user = user;
        if (user.id) {
          let res = await this.api.get('query', { select: ["*"], table: "book", where: { payjp: params.payjp, user: user.id } });
          this.books = res.books;
          if (this.books.length) {
            let amount = 0;
            for (let book of this.books) {
              amount += book.amount;
            }
            this.book0 = {
              from: new Date(this.books[0].dated), to: new Date(this.books[this.books.length - 1].dated),
              amount: amount, method: Number(this.books[0].payjp) ? "hold" : "pay", aday: this.books[0].aday, payjp: params.payjp, item: {}, unit: {}
            };
            let room = await this.calendarService.load(this.books[0].prop, params.payjp);
            if (room[this.books[0].room]) {
              this.room = room[this.books[0].room];
              this.title = `${this.room.na}の予約詳細`;
              this.prop = PROPS.filter(prop => { return prop.id === this.room.prop; })[0];
              this.param = { id: params.payjp, na: `「${this.room.na}」の予約詳細`, txt: this.room.txt, img: this.room.img, cursor: null };
            }
            let res = await this.api.get('query', { select: ["*"], table: "unit", where: { payjp: params.payjp, user: user.id }, order: { dated: "", idx: "" } });
            res.units.map(unit => {
              if (!this.book0.item[unit.dated]) this.book0.item[unit.dated] = [];
              this.book0.item[unit.dated].push(unit.charge);
            })
            this.units = [];
            let items: number[] = this.book0.item[this.dateFormat(this.book0.from)];
            const pushUnit = (items: number[], from: Date) => {
              const unit = new TermUnit(items, from);
              this.units.push(unit);
              this.unitStrs.push({ ...unit.toString(this.room.charge), size: unit.size(this.room.charge) });
            }
            pushUnit(items ? items : [], this.book0.from);
            for (let d = new Date(this.book0.from); d <= this.book0.to; d.setDate(d.getDate() + 1)) {
              let dated = this.dateFormat(d);
              this.book0.unit[dated] = this.book0.item[dated] ? new Unit(this.book0.item[dated]).toStringAll(this.room.charge) : "";
              if (this.book0.item[dated] && JSON.stringify(items) !== JSON.stringify(this.book0.item[dated])) {
                pushUnit(this.book0.item[dated], d);
                items = this.book0.item[dated];
                if (this.units.length > 1) this.units[this.units.length - 2].to = new Date(new Date(d).setDate(d.getDate() - 1));
              }
            }
            if (this.units.length > 0) this.units[this.units.length - 1].to = new Date(this.book0.to);
            this.book = { ...JSON.parse(JSON.stringify(this.book0)), from: new Date(this.book0.from), to: new Date(this.book0.to) };
            this.calendarService.book.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(res => {
              console.log('fire detail.page!');
              if (this.room.id === res.room && this.book.from && this.book.to) { this.change(false); }
            })
          } else {
            this.book0 = BOOK;
          }
        } else {
          this.books = [];
          this.param = { id: null, na: "", txt: "", img: "", cursor: null };
          this.book0 = BOOK;
        }
      });
    });
  }
  openCalendar() {
    let days: DayConfig[] = [];
    Object.keys(this.room.day).forEach(d => {
      let subTitle;
      if (this.room.day[d].status) {
        subTitle = this.status[this.room.day[d].status];
      } else {
        subTitle = new Intl.NumberFormat().format(Math.floor((this.room.day[d].price + this.units[0].amount(this.room.day[d].charge)) * this.room.day[d].rate / 100));
      }
      days.push({ date: new Date(d), subTitle: subTitle, cssClass: this.room.day[d].css, disable: this.room.day[d].status ? true : false })
    })
    this.calendarService.open(days, [this.book.from, this.book.to]).then(res => {
      if (res) {
        this.book = { ...this.book, from: res.from, to: res.to, item: {}, unit: {} };
        let i = 0;//fromからの日数 
        let j = 0;//現在のunits添字
        for (let d = new Date(res.from); d <= res.to; d.setDate(d.getDate() + 1)) {
          const dated = this.dateFormat(d);
          this.book.item[dated] = this.units[j].items;
          this.book.unit[dated] = new Unit(this.units[j].items).toStringAll(this.room.day[dated].charge);
          if (new Date(this.units[j].from).setDate(this.units[j].from.getDate() + i) >= this.units[j].to.getTime()) {
            this.units[j].to = new Date(d);
            this.units[j].from = new Date(new Date(d).setDate(d.getDate() - i));
            if (this.units.length - 1 > j) {
              i = -1; j++;
            }
          }
          i++;
        }
        this.units[j].to = new Date(res.to);
        this.units[j].from = new Date(new Date(res.to).setDate(res.to.getDate() - (i - 1)));
        for (j; j < this.units.length - 1; j++) { //日程が短くなった場合の余ったunitsの処理
          this.units[j].from = null; this.units[j].to = null;
        }
        this.change(this.book0.from !== res.from || this.book0.to !== res.to)
      }
    })
  }
  async openUnit(unit: TermUnit) {
    let modal = await this.modal.create({
      component: UnitComponent,
      componentProps: { unit: unit, user: this.user, charge: this.room.charge }
    });
    modal.present();
    modal.onDidDismiss().then(event => {
      if (event.data) {
        this.units.map((u, i) => {
          if (u.from.getTime() === unit.from.getTime()) {
            u.items = event.data.items;
            this.unitStrs[i] = { ...u.toString(this.room.charge), size: u.size(this.room.charge) };
          }
          return u;
        })
        let isChange = false;
        for (let d = new Date(unit.from); d <= unit.to; d.setDate(d.getDate() + 1)) {
          const dated = this.dateFormat(d)
          this.book.item[dated] = event.data.items;
          this.book.unit[dated] = new Unit(event.data.items).toStringAll(this.room.charge);
          if (JSON.stringify(this.book.item[dated]) !== JSON.stringify(this.book0.item[dated])) isChange = true;
        }
        this.change(isChange);
      }
    });
  }
  change(isChange: boolean) {
    const room = this.calendarService.calc(this.room, this.units[0], this.book.from, this.book.to, this.book.item, this.book0.item);
    this.book.amount = room.amount;
    if (room.pop) this.ui.pop(room.pop);
    this.isChange = room.status ? false : isChange || this.isChange;
  }
  cancel() {
    this.book = { ...BOOK, payjp: this.book.payjp, method: this.book.method };
    this.isChange = true
  }
  pay(token) {
    this.api.post('book', {
      uid: this.user.id, na: this.user.na, avatar: this.user.avatar, prop: this.prop.id, room: this.room.id, token: token,
      amount: this.book.amount, from: this.dateFormat(this.book.from), to: this.dateFormat(this.book.to),
      unit: JSON.stringify(this.book.unit), item: JSON.stringify(this.book.item), payjp: this.book.payjp,
    }, '手続中').then(res => {
      const book = { room: this.room.id, from: new Date(this.book.from).getTime(), to: new Date(this.book.to).getTime(), qty: res.cancel ? 0 : 1, dated: new Date(res.booked).getTime(), item: this.book.item };
      this.calendarService.booking(this.user, book, { ...book, from: new Date(this.book0.from).getTime(), to: new Date(this.book0.to).getTime(), qty: 1, item: this.book0.item });
      this.ui.alert(`${res.cancel ? "キャンセル" : "変更"}しました。`);
      this.router.navigate([`reserve`]);
    }).catch(err => {
      this.ui.alert(`手続きに失敗しました。`);
    });
  }
  night(from: Date, to: Date): number {//宿泊数の計算
    return Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'    
    if (date) {
      var y = date.getFullYear();
      var m = ("0" + (date.getMonth() + 1)).slice(-2);
      var d = ("0" + date.getDate()).slice(-2);
      return y + "-" + m + "-" + d;//+ " " + h + ":" + min + ":" + sec;
    } else {
      return "";
    }
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }


}
const BOOK = { from: null, to: null, amount: null, aday: null, payjp: null, method: null, item: {}, unit: {} };
class TermUnit extends Unit {
  from: Date;
  to: Date;
  str: any;
  constructor(items: number[], from: Date | string, to?: Date | string) {
    super(items);
    this.from = new Date(from);
    this.to = to ? new Date(to) : new Date(this.from);
    this.str = {};
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