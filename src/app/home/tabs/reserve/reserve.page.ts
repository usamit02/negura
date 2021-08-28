import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, filter, skip } from 'rxjs/operators';
import { StateService } from '../../../service/state.service';
import { UserService } from '../../../service/user.service';
import { ApiService } from '../../../service/api.service';
import { UiService } from '../../../service/ui.service';
import { DayConfig } from 'ion2-calendar';
import { UnitComponent } from './unit/unit.component';
import { Unit } from './unit/class';
import { CalendarService } from '../../tabs/reserve/calendar.service';
import { ROOMTYPS, PROPS } from '../../../config';
import { Prop, PROP, User, USER, Room , RoomTyp } from '../../../class';
@Component({
  selector: 'app-reserve',
  templateUrl: 'reserve.page.html',
  styleUrls: ['reserve.page.scss']
})
export class ReservePage implements OnInit, OnDestroy {
  from: Date = new Date(new Date().setHours(0, 0, 0, 0));
  to: Date = new Date(new Date().setHours(0, 0, 0, 0));
  room: any = {};
  roomTyps: Array<RoomTyp>;
  books = [];
  prop: Prop = PROP;
  user: User = USER;
  unit: Unit = new Unit();
  unitStr: any = {};
  sizeStr = "";
  editable = false;
  private onDestroy$ = new Subject();
  constructor(public modal: ModalController, private state: StateService, private userService: UserService, private api: ApiService, private ui: UiService,
    private router: Router, public calendarService: CalendarService,) {
  }
  ngOnInit() {
    this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe(prop => {
      this.prop = prop;
      this.calendarService.load(prop.id).then(room => {
        this.room = room;
        this.calendarService.unit.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(unit => {
          if (unit.items.length) {
            this.unit = unit;
            this.unitStr = unit.toString(room.std.charge);
            this.sizeStr = unit.size(room.std.charge).toString();            
          } else {
            this.calendarService.unit.next(new Unit([1, 1, 2]));
          }
          this.calc();
        })
        this.calendarService.book.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(res => {
          console.log('fire reserve.page!');
          const isChange = (item: any) => {
            if (item) {
              let res = false;
              for (let d = new Date(this.from); d <= this.to; d.setDate(d.getDate() + 1)) {
                const dated = this.dateFormat(d);
                if (item[dated]) {
                  this.unit.items.map(i => {
                    if (this.room.charge[dated][i] && item[dated].includes(i)) {
                      res = true;
                    }
                  })
                }
              }
              return res;
            }
            return false;
          }
          if (isChange(res.item1) || isChange(res.item0)) {
            this.calc(); console.log(`calc総当たり発生`);
          } else if (this.room[res.room]) {
            this.calc(this.room[res.room]);
          }
          if (this.user.id === res.user) {
            this.loadBook();
          }
        })
        //this.openCalendar();//setTimeout(()=>{this.openCalendar();},2000);
      }).catch(err => {
        this.ui.alert(`施設情報の読み込みに失敗しました。\r\n${err.message}`);
      })
    });
    this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      this.user = user;
      if (user.id) {
        this.loadBook();
        this.editable = (this.prop.users.filter(uid => { return uid === user.id; }).length) ? true : false;//||user.admin
      } else {
        this.books = []; this.editable = false;
      }
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)
    ).pipe(takeUntil(this.onDestroy$)).subscribe((event: NavigationEnd) => {
      if (this.user.id && event.url === `/${this.prop.host}/reserve`) {
        this.loadBook();
      }
    });
  }
  calc(room?) {
    if (room) {//予約が入ったとき
      const typs = this.roomTyps.filter(typ => { return typ.id === room.typ; });
      if (typs.length) {
        this.room[room.id] = this.calendarService.calc(room, this.unit, this.from, this.to);
        typs[0].rooms = [];
        Object.keys(this.room).forEach(id => {
          if (this.room[id].typ === typs[0].id) typs[0].rooms.push(this.room[id]);
        })
      }
    } else {//ロード時及び日程または構成変更時
      this.roomTyps = [];
      this.roomTyps = this.prop.roomTyps.map(typ => {
        let rooms = [];
        Object.keys(this.room).forEach(id => {
          if (this.room[id].typ === typ) rooms.push(this.calendarService.calc(this.room[id], this.unit, this.from, this.to));
        })
        //並び替え
        return { id: typ, na: ROOMTYPS.filter(roomTyp => { return roomTyp.id === typ })[0].na, rooms: rooms };
      });
    }
  }
  loadBook() {
    this.api.get('query', { select: ['*'], table: 'booking', where: { user: this.user.id }, order: { from: "DESC" } }).then(res => {
      this.books = res.books.map(book => {
        book.HOME = PROPS.filter(prop => { return prop.id == book.prop })[0].na;
        book.amount = Number(book.amount);
        return book;
      });
    });
  }
  async openCalendar() {
    let days: DayConfig[] = []; const status = { close: "休止中", full: "満　室", over: "満　員", short: "在庫不足", aday: "日帰不可", min: "下限未満", max: "上限超過" };
    Object.keys(this.room.std.day).forEach(d => {
      const subTitle = this.room.std.day[d].status ? status[this.room.std.day[d].status] : "";
      days.push({ date: new Date(d), subTitle: subTitle, cssClass: this.room.std.day[d].css, disable: this.room.std.day[d].status ? true : false })
    })
    const today = new Date().setHours(0, 0, 0, 0);
    this.calendarService.open(days, this.from.getTime() === today && this.to.getTime() === today ? [] : [this.from, this.to]).then(res => {
      if (res) {
        this.from = res.from; this.to = res.to;
        this.calc();
      }
    })
  }
  async openUnit() {
    let modal = await this.modal.create({
      component: UnitComponent,
      componentProps: { unit: this.unit, user: this.user, charge: this.room.std.charge }
    });
    modal.present();
    modal.onDidDismiss().then(event => {
      if (event.data) {
        this.calendarService.unit.next(event.data);
      }
    });
  }
  clickRoom(room) {
    if (room.pop) {
      this.ui.pop(`${room.pop}`);
    } else {
      this.router.navigate(['reserve', this.prop.id, room.id, this.dateFormat(this.from), this.dateFormat(this.to)]);//, { queryParams: { prop: this.prop.id, room: room.id, from: this.dateFormat(this.from), to: this.dateFormat(this.to) }});
    }
  }
  clickBook(book) {
    this.router.navigate(['reserve/detail', book.payjp])//(['meet', book.home + book.from.replace(/\-/g, "")]);
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'    
    var y = date.getFullYear();
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    var d = ("0" + date.getDate()).slice(-2);
    //var h = date.getHours();
    //var min = date.getMinutes();
    //var sec = date.getSeconds();
    return y + "-" + m + "-" + d;//+ " " + h + ":" + min + ":" + sec;
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
  cron() {
    this.api.get("cron", {}).then(res => {
      console.log(res.msg);
      this.loadBook();
    })
  }
}

/*
const culc = (room) => {
      room.amount = 0;
      for (let d = new Date(this.from); d <= this.to; d.setDate(d.getDate() + 1)) {
        let date = this.dateFormat(d);
        if (room.day[date].status === "close" || room.day[date].status === "full") {
          room.status = room.day[date].status; room.amount = null; break;
        } else {
          const items = this.unit.closes(room.day[date].charge);
          if (items.length) {

          } else if (room.day[date].book.size + this.unit.size(room.day[date].charge) > room.day[date].size) {
            room.status = "over"; room.amount = null; break;
          } else {
            room.amount += Math.floor((room.day[date].price + this.unit.amount(room.day[date].charge)) * room.day[date].rate / 100);
            room.status = "";
          }
        }
      }
      return room;
    }
this.roomTyps.map(typ => {
        return typ.rooms.map(r => {
          calc(r);
        })



*/