import { Injectable } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { ApiService } from '../../../service/api.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { CalendarModal, CalendarModalOptions, DayConfig } from '../../../component/calendar';//'ion2-calendar';
import { HOLIDAYS, PROPS } from '../../../config';
import { Unit } from './unit/class';
import { Room, ROOM, User } from '../../../class';
@Injectable({ providedIn: 'root' })
export class CalendarService {
  to: Date = new Date(new Date().setHours(0, 0, 0, 0));
  room: any = {};
  book = new BehaviorSubject(<any>{});
  unit = new BehaviorSubject(new Unit());
  loaded: boolean = false;
  aday: boolean = false;//日帰り
  constructor(private api: ApiService, private db: AngularFireDatabase, private modal: ModalController, private loader: LoadingController,) { }
  load(prop: number, payjp?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.loaded) {
        const loading = await this.loader.create({ message: '計算中です...', duration: 30000 });//this.ui.loading();    
        await loading.present();
        const from = new Date(this.to);
        const props = PROPS.filter(p => { return p.id == prop });
        let term = props.length && props[0].term ? props[0].term : "1m";
        let dif = term.slice(-1);
        let add = Number(term.replace(dif, ""));
        if (dif === "m") {
          this.to.setMonth(this.to.getMonth() + add);
        } else if (dif === "d") {
          this.to.setDate(this.to.getDate() + add);
        }
        let w; let css; let day: any = {}; day.std = {}; let charge: any = {}; charge.std = {}; charge.max = {};
        let param: any = { prop: prop, from: this.dateFormat(from), to: this.dateFormat(this.to) };
        if (payjp) param.payjp = payjp;
        this.api.get('calendar', param).then(res => {
          charge.qty = {};//prop全体の在庫制限
          for (let c of res.charges) {
            if (c.room === -1) {
              charge.qty[c.id] = c.qty;
            } else if (c.room === 0) {
              charge.std[c.id] = { na: c.na, ext: c.ext, typ: c.typ, icon: c.icon, min: c.min, max: c.max, price: c.price, size: c.size, qty: c.qty, idx: c.idx };
            } else {
              if (!charge[c.room]) {
                charge[c.room] = { ...charge.std };
              }
              charge[c.room][c.id] = { na: c.na, ext: c.ext, typ: c.typ, icon: c.icon, min: c.min, max: c.max, price: c.price, size: c.size, qty: c.qty, idx: c.idx };
            }
            let m = charge.max[c.id];
            if (m) {
              charge.max[c.id] = { na: c.na, ext: c.ext, typ: c.typ, icon: c.icon, min: m.min < c.min ? m.min : c.min, max: m.max > c.max ? m.max : c.max, price: m.price > c.price ? m.price : c.price, size: m.size > c.size ? m.size : c.size, qty: m.qty > c.qty ? m.qty : c.qty, idx: c.idx };
            } else {
              charge.max[c.id] = { na: c.na, ext: c.ext, typ: c.typ, icon: c.icon, min: c.min, max: c.max, price: c.price, size: c.size, qty: c.qty, idx: c.idx };
            }
          }
          let allCharge: any = {};
          allCharge.book = {};
          for (let d = new Date(from); d <= this.to; d.setDate(d.getDate() + 1)) {
            w = d.getDay();
            if (w === 0) {
              css = "sunday";
            } else if (w === 6) {
              css = "satday";
            } else {
              css = "";
            }
            const dated = this.dateFormat(d);
            day.std[dated] = { price: 0, rate: 100, qty: 0, size: 0, book: { qty: 0, size: 0, charge: {} }, charge: { ...charge.std }, status: "", css: css }
            allCharge.book[dated] = {};
            allCharge[dated] = { ...charge.qty };
          }
          for (let holiday of HOLIDAYS) {
            let d = new Date(holiday);
            if (from.getTime() <= d.getTime() && d.getTime() <= this.to.getTime()) {
              day.std[this.dateFormat(d)].css = "sunday";
            }
          }
          for (let cal of res.calendars) {
            if (cal.close) {
              day.std[cal.dated].close = true;
            } else if (cal.price) {
              day.std[cal.dated].price = cal.price;
            } else if (cal.rate) {
              day.std[cal.dated].rate = cal.rate;
            }
          }
          res.rooms.map((room: Room) => {
            this.room[room.id] = room;
            day[room.id] = JSON.parse(JSON.stringify(day.std));
            Object.keys(day[room.id]).forEach(d => {
              day[room.id][d].price = day.std[d].price + room.price;
              day[room.id][d].qty = room.qty;
              day[room.id][d].size = room.size; //日ごとにsizeを変えらるようにしたい
              day[room.id][d].aday = room.aday;
              if (day.std[d].close || room.close) day[room.id][d].status = "close";
              day[room.id][d].charge = charge[room.id] ? { ...charge[room.id] } : { ...charge.std };
            })
          });
          for (let cal of res.room_calendars) {
            //day[cal.room][cal.dated] = { ...day.std[cal.dated] };
            if (cal.close) {
              day[cal.room][cal.dated].status = 'close';
            }
            if (cal.price) {
              day[cal.room][cal.dated].price = day.std[cal.dated].price + cal.price;
            } else if (cal.rate) {
              day[cal.room][cal.dated].rate = Math.floor(day[cal.room][cal.dated].rate * cal.rate / 100);//Math.floor(room.price * cal.rate);
            }
            if (cal.qty) {
              day[cal.room][cal.dated].qty = cal.qty;
            }
            if (cal.size) {
              day[cal.room][cal.dated].size = cal.size;
            }
            if (cal.aday) {
              day[cal.room][cal.dated].aday = cal.aday;
            }
          }
          for (let cal of res.charge_calendars) {
            if (cal.room === -1) {
              if (cal.close) {
                delete allCharge[cal.dated][cal.id];
              } else {
                allCharge[cal.dated][cal.id] = cal.qty == null ? allCharge[cal.dated][cal.id] : cal.qty;
              }
            } else if (cal.close) {
              delete day[cal.room][cal.dated].charge[cal.id];
            } else {
              let over = { min: cal.min, max: cal.max, price: cal.price, size: cal.size, qty: cal.qty, close: cal.close };
              if (!over.close) delete over.close;
              Object.keys(over).forEach(key => {
                if (over[key] == null) {
                  delete over[key];
                }
              })
              if (cal.room === 0) {
                Object.keys(day).forEach(room => {
                  if (cal.rate && !cal.price) {
                    over.price = Math.floor(day[room][cal.dated].charge[cal.id].price * cal.rate / 100);
                  }
                  day[room][cal.dated].charge[cal.id] = { ...day[room][cal.dated].charge[cal.id], ...over };
                })
              } else {
                if (cal.rate && !cal.price) {
                  over.price = Math.floor(day[cal.room][cal.dated].charge[cal.id].price * cal.rate / 100);
                }
                day[cal.room][cal.dated].charge[cal.id] = { ...day[cal.room][cal.dated].charge[cal.id], ...over };
              }
            }
          }
          for (let book of res.books) {
            let d = day[book.room][book.dated];
            d.book = { qty: Number(book.qty), size: Number(book.size), charge: {} };
            if (!d.status) {
              if (d.book.qty >= d.qty) {
                d.status = 'full';
              } else if (d.size && d.book.size > d.size) {
                d.status = 'over';
              }
            }
          }
          for (let c of res.units) {
            let d = day[c.room][c.dated];
            const id = c.charge;
            d.book.charge[id] = c.qty;
            if (!d.status && d.book.charge[id] >= d.charge[id].qty) {
              d.status = 'short';
            }
            if (allCharge.book[c.dated][id]) {
              allCharge.book[c.dated][id] += c.qty;
            } else {
              allCharge.book[c.dated][id] = c.qty;
            }
          }
          Object.keys(this.room).forEach(room => {
            this.room[room].day = day[room];
            this.room[room].charge = charge[room] ? charge[room] : charge.std;
          })
          this.room.std = { ...ROOM, day: day.std, charge: charge.max };
          this.room.charge = allCharge;
          this.loaded = true;
          this.db.database.ref(`book/${prop}`).orderByChild('upd').startAt(new Date().getTime()).limitToLast(1).on('child_added', snapshot => {
            const doc = snapshot.val();
            console.log(`booking ${doc.txt}`);
            let room = this.room[doc.room];
            const calc = (book: Book, dec?: boolean) => {
              const direction = dec ? -1 : 1;
              for (let d = new Date(book.from); d <= book.to; d.setDate(d.getDate() + 1)) {
                const dated = this.dateFormat(d);
                let day = room.day[dated];
                day.book.qty += book.qty * direction;
                if (day.book.qty >= day.qty) {
                  day.status = 'full';
                  break;
                } else if (day.status = 'full') {
                  day.status = '';
                }
                const unit = new Unit(book.item[dated]);
                day.book.size += unit.size(room.charge) * direction;/*
                if (day.size && day.book.size > day.size) {
                  day.status = 'over';
                  break;
                }*/
                const charge = unit.charge();
                for (let key of Object.keys(charge)) {
                  if (day.book.charge[key]) {
                    day.book.charge[key] += charge[key] * direction;
                  } else if (direction > 0) {
                    day.book.charge[key] = charge[key];
                  } else {
                    alert("システムエラー　予約済chargeの減算に失敗しました。");
                  }
                  if (this.room.charge.book[dated][key]) {
                    this.room.charge.book[dated][key] += charge[key] * direction;
                  } else if (direction > 0) {
                    this.room.charge.book[dated][key] = charge[key];
                  } else {
                    alert("システムエラー　予約済allchargeの減算に失敗しました。")
                  }
                }
              }
            }
            if (doc.book1.qty) {
              calc(doc.book1);
            }
            if (doc.book0) {
              calc(doc.book0, true);
            }
            this.book.next({ room: doc.room, user: doc.uid, item1: doc.book1.item, item0: doc.book0 && doc.book0.item ? doc.book0.item : {} });
          });
          resolve(this.room);
        }).catch(err => {
          alert("計算失敗しました。");
          console.error(err.message);
          reject();
        }).finally(() => {
          loading.dismiss();
        })
      } else {
        resolve(this.room);
      }
    });
  }
  booking(user: User, book1: Bookdb, book0?: Bookdb) {/*
    let room = this.room[book1.room.id];
    const calc = (book: Book, dec?: boolean) => {
      const direction = dec ? -1 : 1;
      for (let d = new Date(book.from); d <= book.to; d.setDate(d.getDate() + 1)) {
        const dated = this.dateFormat(d);
        let day = room.day[dated];
        day.book.qty += book.qty * direction;
        if (day.book.qty >= day.qty) {
          day.status = 'full';
          break;
        } else if (day.status = 'full') {
          day.status = '';
        }
        const unit = new Unit(book.item[dated]);
        day.book.size += unit.size(room.charge) * direction;
     
        const charge = unit.charge();
        for (let key of Object.keys(charge)) {
          if (day.book.charge[key]) {
            day.book.charge[key] += charge[key] * direction;
          } else if (direction > 0) {
            day.book.charge[key] = charge[key];
          } else {
            alert("システムエラー　予約済chargeの減算に失敗しました。");
          }
          if (this.room.charge.book[dated][key]) {
            this.room.charge.book[dated][key] += charge[key] * direction;
          } else if (direction > 0) {
            this.room.charge.book[dated][key] = charge[key];
          } else {
            alert("システムエラー　予約済allchargeの減算に失敗しました。")
          }
        }
      }
    }
    if (book1.qty) {
      calc(book1);
    }
    if (book0) {
      calc(book0, true);
    }*/
    const dateFormat = (date: number) => {
      let d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    const from = book1.from ? dateFormat(book1.from) : dateFormat(book0.from);
    const to = book1.to ? dateFormat(book1.to) : dateFormat(book0.to);
    let txt = from === to ? from : `${from}～${to}`;
    const url = `reserve/${this.room[book1.room].prop}/${book1.room}/${this.dateFormat(book1.from ? new Date(book1.from) : new Date(book0.from))}/${this.dateFormat(book1.to ? new Date(book1.to) : new Date(book0.to))}`;
    let doc: any = {
      uid: user.id, na: user.na, avatar: user.avatar, url: url, bookd: book1.dated, upd: new Date().getTime(),
      room: book1.room, txt: `${txt} ${this.room[book1.room].na}`, cancel: book1.from ? 0 : 1, book1: book1
    };
    if (book0) { doc.book0 = book0; }
    this.db.database.ref(`book/${this.room[book1.room].prop}`).push(doc);
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
  open(days: DayConfig[], DefaultDates: Date[]): Promise<any> {
    return new Promise(async (resolve) => {
      let to;
      if (DefaultDates[1]) {
        to = new Date(DefaultDates[1]);
        to = new Date(to.setDate(to.getDate() + 1));
      }
      const options: CalendarModalOptions = {
        pickMode: 'range',
        title: `予約日を選択`,
        from: new Date(), to: this.to,
        weekdays: ['日', '月', '火', '水', '木', '金', '土'],
        closeIcon: true, doneIcon: true, cssClass: 'calendar',
        monthFormat: 'YYYY年M月', defaultScrollTo: new Date(new Date().setHours(0, 0, 0, 0)),
        daysConfig: days, defaultDateRange: { from: DefaultDates[0], to: to }
      };
      let myCalendar = await this.modal.create({
        component: CalendarModal,
        componentProps: { options }
      });
      myCalendar.present();
      myCalendar.onDidDismiss().then(event => {
        if (event.data) {
          const from = new Date(event.data.from.string);
          let to = new Date(event.data.to.string);
          if (from.getTime() === to.getTime()) {
            this.aday = true;
          } else {
            this.aday = false;
            to.setDate(to.getDate() - 1);
          }
          resolve({ from: from, to: to });
        } else {
          resolve(false);
        }
      })
    })
  }
  calc(room, unit: Unit, from: Date, to: Date, item?, item0?) {//item0=変更前のunit内容
    console.log(`calc start room:${room.na}...........`)
    room.amount = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      let dated = this.dateFormat(d);
      if (!item0 && (room.day[dated].status === "close" || room.day[dated].status === "full")) {
        room.msg = status[room.day[dated].status];
        room.pop = `${dated}は「${room.msg}」のため選択できません。`;
        room.status = room.day[dated].status; room.amount = null;
        break;
      }
      unit = item && item[dated] ? new Unit(item[dated]) : unit;//itemがあれば日別unitに対応する
      const items = unit.closes(room.day[dated].charge);//対応不可のitemがunitにないかチェック
      if (items.length) {
        room.amount = null;
        room.status = "disable";
        room.disables = items;
        let str = "";
        for (let i of items) {
          str += `${this.room.std.charge[i].na}、`;
        }
        room.pop = `${dated}の${str.slice(0, -1)}は予約を中止しています。`;
        room.msg = `${str.slice(0, -1)}×`;
        break;
      }
      let charge = unit.charge();
      let charge0 = item && item0[dated] ? new Unit(item0[dated]).charge() : {};
      let str = { qty: "", min: "", max: "" };
      for (let key of Object.keys(charge)) {
        const bookedQty = room.day[dated].book.charge[key] ? room.day[dated].book.charge[key] : 0;//予約済の数量
        const qty0 = charge0[key] ? charge0[key] : 0;//変更前の予約数量
        if (room.day[dated].charge[key].qty < bookedQty - qty0 + charge[key]) {
          str.qty += `${room.day[dated].charge[key].na}、`;
        }
        const allBookedQty = this.room.charge.book[dated][key] ? this.room.charge.book[dated][key] : 0;//施設全体で予約済の数量
        if (this.room.charge[dated][key] < allBookedQty - qty0 + charge[key]) {
          str.qty += `${room.day[dated].charge[key].na}、`;
        }
        if (room.day[dated].charge[key].min != null && room.day[dated].charge[key].min > charge[key]) {
          str.min = `${room.day[dated].charge[key].na}、`;
        } else if (room.day[dated].charge[key].max != null && room.day[dated].charge[key].max < charge[key]) {
          str.max = `${room.day[dated].charge[key].na}、`;
        }
      }
      if (str.qty) {
        room.pop = `${dated}の${str.qty.slice(0, -1)}が在庫不足のため選択できません。`; room.msg = "在庫不足";
        room.status = "short"; room.amount = null; break;
      } else if (str.min) {
        room.pop = `${dated}の${str.min.slice(0, -1)}が下限未満のため選択できません。`; room.msg = `${str.max.slice(0, -1)}▼`;
        room.status = "min"; room.amount = null; break;
      } else if (str.max) {
        room.pop = `${dated}の${str.max.slice(0, -1)}が上限超過のため選択できません。`; room.msg = `${str.max.slice(0, -1)}▲`;
        room.status = "max"; room.amount = null; break;
      }
      let size: number = unit.size(room.day[dated].charge);
      if (item0 && item0[dated]) size -= new Unit(item0[dated]).size(room.day[dated].charge);
      if (room.day[dated].size && room.day[dated].book.size + size > room.day[dated].size) {
        room.pop = `${dated}は満員のため選択できません。`; room.msg = "満員";
        room.status = "over"; room.amount = null; break;
      } else if (this.aday && !room.day[dated].aday) {
        room.pop = `${dated}は宿泊のみ。`; room.msg = "日帰不可";
        room.status = "aday"; room.amount = null; break;
      } else {
        room.amount += Math.floor((room.day[dated].price + unit.amount(room.day[dated].charge)) * room.day[dated].rate / 100);
        room.status = ""; room.pop = ""; room.msg = "";
      }
    }
    return room;
  }

}
export interface Book {
  prop: number;
  room: Room;
  from: Date;
  to: Date;
  qty: number;
  user: User;
  dated: Date;
  item: any;
}
interface Bookdb {
  room: number;
  from: number;
  to: number;
  qty: number;
  dated: number;
  item: any;
}