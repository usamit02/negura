import { Component, OnChanges, OnInit, Input, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { HOLIDAYS } from '../../../../../config';
import { ApiService } from '../../../../../service/api.service';
import { UiService } from '../../../../../service/ui.service';
import { CalendarComponentOptions, DayConfig } from '../../../../../component/calendar';
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit {
  @Input() room: any;
  @Input() prop: number;
  @Input() param: any;//{day:any,data:any,typ:string,otas:any}
  calendar = {
    close: new FormControl(0),//weeks:new FormControl(['0']),    
    qty: new FormControl(null, [Validators.min(0), Validators.max(100), Validators.pattern('^[0-9.]+$')]),
    price: new FormControl(null, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
    rate: new FormControl(null, [Validators.min(1), Validators.max(1000), Validators.pattern('^[0-9.]+$')]),
  }
  calendarForm = this.builder.group({
    close: this.calendar.close, qty: this.calendar.qty, price: this.calendar.price, rate: this.calendar.rate,//weeks:this.calendar.weeks,
  });
  day: any = {}; days: DayConfig[] = [];
  calendarOption: CalendarComponentOptions = {
    pickMode: 'range', weekdays: ['日', '月', '火', '水', '木', '金', '土'], monthFormat: 'YYYY年M月', color: "secondary",
    monthPickerFormat: ['１月', '２月', '３月', '４月', '５月', '６月', '７月', '８月', '９月', '１０月', '１１月', '１２月'],
  };
  range = { from: new Date(), to: new Date() };
  weeks = ['-1'];//１週間以上range選択時のみ現れる曜日選択セレクトボックスの値　-1は全日　7は祝前日 1-6はgetDay()の値
  month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);//現在のカレンダー表示月の初日
  plan: any = {}; plans: Plan[] = []; monthPlans: Plan[] = [];
  data: any = {};
  otas = [];
  change = false;//room_calendarの変更があったかどうか
  constructor(private api: ApiService, private ui: UiService, private builder: FormBuilder, public modal: ModalController,) { }
  ngOnInit() {
    if (Object.keys(this.param.day).length) {
      this.day = this.param.day;
      this.data = this.param.data;
      Object.keys(this.data).forEach(d => {
        this.setCalendar(new Date(d), this.data[d]);
      })
      this.setDays();
    } else {
      this.ui.loading(`予定読込中...`);
      this.api.get('query', { select: ['*'], table: 'calendar', where: { prop: this.prop } }).then(async calendar => {
        this.day = {}; let d; let date: string;
        let from = new Date(); let to = new Date(new Date().setMonth(new Date().getMonth() + 12));
        for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
          let w = d.getDay();
          date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          if (w === 0) {
            this.day[date] = { cssClass: "sunday", disable: false };
          } else if (w === 6) {
            this.day[date] = { cssClass: "satday", disable: false };
          }
        }
        for (let holiday of HOLIDAYS) {
          d = new Date(holiday);
          this.day[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] = { cssClass: "sunday", disable: false };//this.days.push({ date: new Date(day), cssClass: "sunday" });
        }
        for (let room of calendar.calendars) {
          d = new Date(room.dated);
          date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          if (room.close) {
            this.day[date] = { subTitle: "お休み", disable: true, ...this.day[date] };
          } else if (room.rate) {
            this.day[date] = { subTitle: `${room.rate}%`, disable: false, ...this.day[date] };
          }
        }
        this.plan = {}; this.data = {};
        const res = await this.api.get('query', { select: ['*'], table: 'room_calendar', where: { room: this.room.id } });
        for (let room of res.room_calendars) {
          this.setCalendar(new Date(room.dated), room);
        }
        this.setDays();
      }).catch(err => {
        this.ui.alert(`施設情報の読み込みに失敗しました。\r\n${err.message}`);
      }).finally(() => {
        this.ui.loadend();
      });
    }
    if (this.param.otas.length) {
      this.otas = this.param.otas;
    } else {
      this.api.get('query', { select: ['*'], table: 'beds24ota', where: { room: this.room.id } }).then(res => {
        this.otas = res.beds24otas;
      });
    }
  }
  setCalendar(d: Date, room: any) {
    const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    this.data[date] = { price: room.price, rate: room.rate, qty: room.qty, close: room.close };
    if (room.close) {
      this.day[date] = { ...this.day[date], subTitle: "休止", marked: true };
      this.plan[date] = { txt: '休止', typ: "close" };
    } else if (!(this.day[date] && this.day[date].disable)) {
      if (this.day[date]) {
        Object.keys(this.day[date]).forEach(key => {
          if (key === "subTitle" || key === "marked") delete this.day[date][key];
        })
      }
      if (this.param.typ === 'price') {
        if (room.price) {
          this.day[date] = { ...this.day[date], subTitle: `${room.price}`, marked: true };
          this.plan[date] = { txt: room.price, typ: "price" };
        } else if (room.rate) {
          this.day[date] = { ...this.day[date], subTitle: `×${room.rate}`, marked: true };
          this.plan[date] = { txt: `${room.rate}%`, typ: "rate" };
        }
      } else if (this.param.typ === 'qty') {
        if (room.qty) {
          this.day[date] = { ...this.day[date], subTitle: `${room.qty}`, marked: true };
          this.plan[date] = { txt: room.qty, typ: "qty" };
        }
      }
    }
  }
  setDays() {
    this.days = [];
    Object.keys(this.day).forEach(date => {
      this.days.push({ date: new Date(date), ...this.day[date] });
    });
    let plans = [];
    Object.keys(this.plan).forEach(date => {
      if (this.plan[date].typ === "close" || this.plan[date].typ === this.param.typ || this.plan[date].typ === "rate" && this.param.typ === "price") {
        let d = new Date(date);
        plans.push({ date: new Date(d), day: date, time: d.getTime(), value: this.plan[date].txt });
      }
    });
    plans.sort((a, b) => a.time - b.time);
    let sumPlans = []; let sums = [];
    for (let i = 0; i < plans.length; i++) {
      sums.push(plans[i]);
      if (i === plans.length - 1 || !(plans[i + 1].time - plans[i].time === 86400000 && plans[i + 1].value === plans[i].value)) {
        sumPlans.push(sums);
        sums = [];
      }
    }
    this.plans = [];
    for (let plans of sumPlans) {
      this.plans.push({ from: plans[0].date, to: plans[plans.length - 1].date, fromTime: plans[0].time, toTime: plans[plans.length - 1].time, value: plans[0].value, range: plans.length === 1 ? false : true });
    }
    this.onMonthChange({ newMonth: { dateObj: this.month, time: this.month.getTime() } });
    this.calendarOption = { ...this.calendarOption, daysConfig: this.days };
  }
  onMonthChange(e) {
    this.month = new Date(e.newMonth.dateObj);
    e.newMonth.dateObj.setMonth(e.newMonth.dateObj.getMonth() + 1);
    const nextMonthTime = e.newMonth.dateObj.getTime();
    this.monthPlans = this.plans.filter(plan => {
      const a = e.newMonth.time <= plan.fromTime && plan.fromTime < nextMonthTime;
      const b = e.newMonth.time <= plan.toTime && plan.toTime < nextMonthTime;
      const c = plan.fromTime <= e.newMonth.time && e.newMonth.time < plan.toTime;
      const d = plan.fromTime < nextMonthTime && nextMonthTime < plan.toTime;
      return a || b || c || d;
    });
  }
  inc(typ: string, val: number) {
    let value = this.calendar[typ].value + val;
    this.calendar[typ].setValue(value);
    this.calendar[typ].markAsDirty();
  }
  addPlan(typ: string) {
    this.calendar[typ].markAsPristine();
    let from = new Date(this.range.from);
    from.setHours(0, 0, 0, 0);
    for (let d = from; d <= this.range.to; d.setDate(d.getDate() + 1)) {
      const day = new Date(d);
      const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
      const w = day.getDay();
      const conHoliday = HOLIDAYS.indexOf(date) !== -1 && (w === 5 || w === 6);//土日前の祝日
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      const preHoliday = HOLIDAYS.indexOf(`${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()}`) !== -1;//祝前日      
      if (this.isWeek && (this.weeks[0] === "-1" || this.weeks.indexOf(d.getDay().toString()) !== -1 || this.weeks.indexOf("7") !== -1 && (conHoliday || preHoliday))) {
        if (typ === "price" && this.data[date]) this.data[date].rate = null;
        if (typ === "rate" && this.data[date]) this.data[date].price = null;
        this.setCalendar(d, { ...this.data[date], [typ]: this.calendar[typ].value });
      }
    }
    this.setDays();
    this.change = true;
  }
  delPlan(plan) {
    const clear = (date: string) => {
      if (this.day[date].subTitle) delete this.day[date].subTitle;
      if (this.day[date].marked) delete this.day[date].marked;
      delete this.plan[date];
    }
    for (let d = new Date(plan.from); d <= plan.to; d.setDate(d.getDate() + 1)) {
      const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      delete this.data[date][this.plan[date].typ];
      if (this.param.typ === 'price') {
        if (this.data[date].price) {
          this.day[date] = { ...this.day[date], subTitle: `${this.data[date].price}`, marked: true };
          this.plan[date] = { txt: this.data[date].price, typ: "price" };
        } else if (this.data[date].rate) {
          this.day[date] = { ...this.day[date], subTitle: `×${Math.floor(this.data[date].rate / 100 * 100) / 100}`, marked: true };
          this.plan[date] = { txt: `${this.data[date].rate}%`, typ: "rate" };
        } else {
          clear(date);
        }
      } else if (this.param.typ === 'qty') {
        if (this.data[date].qty) {
          this.day[date] = { ...this.day[date], subTitle: `${this.data[date].qty}`, marked: true };
          this.plan[date] = { txt: this.data[date].qty, typ: "qty" };
        } else {
          clear(date);
        }
      }
    }
    this.setDays();
    this.change = true;
  }
  isWeek(): boolean {
    return (this.range.to.getTime() - this.range.from.getTime()) / 86400000 > 7;
  }
  save() {
    let inserts = []; let idx = 1;
    Object.keys(this.data).forEach(date => {
      let d = new Date(date);
      Object.keys(this.data[date]).forEach(key => {
        if (this.data[date][key] == null || key === "close" && !this.data[date][key]) {
          delete this.data[date][key];
        }
      })
      if (Object.keys(this.data[date]).length) {
        inserts.push({ dated: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, room: this.room.id, prop: this.prop, idx: idx, ...this.data[date] });
        idx++;
      }
    });
    this.api.post('querys', { table: "room_calendar", delete: { room: this.room.id }, inserts: inserts }, '予定保存中...').then(res => {
      /*  if (this.room.beds24) {
          let dates: any = {};
          let from = new Date();
          from.setDate(from.getDate() + 1);
          from.setHours(0, 0, 0, 0);
          let to = new Date(from);
          Object.keys(this.data).forEach(date => {
            let d = new Date(date);
            if (d.getTime() > to.getTime()) to = new Date(d);
          })
          for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
            const day = `${d.getFullYear()}${("0" + (d.getMonth() + 1)).slice(-2)}${("0" + d.getDate()).slice(-2)}`;
            const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            dates[day] = { p1: this.room.price, i: this.room.qty, o: this.room.close };
            if (this.data[date]) {
              dates[day].p1 = this.data[date].price ? this.data[date].price : this.data[date].rate ? Math.floor(this.room.price * this.data[date].rate / 100) : this.room.price;
              dates[day].i = this.data[date].qty ? this.data[date].qty : this.room.qty;
              dates[day].o = this.data[date].close ? 1 : this.room.close;
            }
          }
          this.api.post('beds24', { json: "setRoomDates", param: { roomId: this.room.beds24, dates: dates } }).then(res => {
            console.log(res);
            if (res.msg !== "ok") {
              throw (res.roomDates[0].error);
            }
          });
        }*/
    }).catch(() => {
      this.ui.alert('プランの保存に失敗しました。');
    }).finally(() => {
      this.modal.dismiss({ day: this.day, data: this.data, otas: this.otas });
    });
  }
}
interface Plan {
  from: Date;
  to: Date;
  fromTime?: number;
  toTime?: number;
  value: string;
  range: boolean;
}
