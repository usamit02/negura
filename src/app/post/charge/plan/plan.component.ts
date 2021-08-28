import { Component, OnChanges, OnInit, Input, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { HOLIDAYS } from '../../../config';
import { ApiService } from '../../../service/api.service';
import { UiService } from '../../../service/ui.service';
import { CalendarComponentOptions, DayConfig } from '../../../component/calendar';
import { UNITTYP } from '../../../home/tabs/reserve/unit/class';
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit {
  @Input() id: number;
  @Input() room: any;
  @Input() prop: number;
  @Input() method: number;
  @Input() typ: string;
  @Input() cache: any;//{day:any,data:any,typ:string}
  calendar = {
    min: new FormControl(null, [Validators.min(1), Validators.max(1000), Validators.pattern('^[0-9.]+$')]),
    max: new FormControl(null, [Validators.min(1), Validators.max(1000), Validators.pattern('^[0-9.]+$')]),
    price: new FormControl(null, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
    rate: new FormControl(null, [Validators.min(0), Validators.max(1000), Validators.pattern('^[0-9.]+$')]),
    qty: new FormControl(null, [Validators.min(0), Validators.max(100), Validators.pattern('^[0-9.]+$')]),
    size: new FormControl(null, [Validators.min(1), Validators.max(1000), Validators.pattern('^[0-9.]+$')]),
    close: new FormControl(0),
  }
  calendarForm = this.builder.group({
    min: this.calendar.min, max: this.calendar.max, price: this.calendar.price, rate: this.calendar.rate, qty: this.calendar.qty,
    size: this.calendar.size, close: this.calendar.close,
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
  change = false;//room_calendarの変更があったかどうか
  constructor(private api: ApiService, private ui: UiService, private builder: FormBuilder, public modal: ModalController,) { }
  ngOnInit() {
    if (Object.keys(this.cache.day).length) {
      this.day = this.cache.day;
      this.data = this.cache.data;
      Object.keys(this.data).forEach(d => {
        this.setCalendar(new Date(d), this.data[d]);
      })
      this.setDays();
    } else {
      this.day = {}; let d; let dated: string;
      let from = new Date(); let to = new Date(new Date().setMonth(new Date().getMonth() + 12));
      for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
        let w = d.getDay();
        dated = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        if (w === 0) {
          this.day[dated] = { cssClass: "sunday", disable: false };
        } else if (w === 6) {
          this.day[dated] = { cssClass: "satday", disable: false };
        }
      }
      for (let holiday of HOLIDAYS) {
        d = new Date(holiday);
        this.day[`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`] = { cssClass: "sunday", disable: false };//this.days.push({ date: new Date(day), cssClass: "sunday" });
      }
      this.plan = {}; this.data = {};
      this.api.get('query', { select: ['*'], table: 'charge_calendar', where: { prop: this.prop, room: this.method, id: this.id } }, "読込中").then(res => {
        for (let cal of res.charge_calendars) {
          this.setCalendar(new Date(cal.dated), cal);
        }
        this.setDays();
      }).catch(err => {
        this.ui.alert(`課金情報の読み込みに失敗しました。\r\n${err.message}`);
      })
    }
  }
  setCalendar(date: Date, cal: any) {
    const d = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    this.data[d] = { min: cal.min, max: cal.max, price: cal.price, rate: cal.rate, qty: cal.qty, size: cal.size, close: cal.close };
    if (cal.close) {
      this.day[d] = { ...this.day[d], subTitle: "休止", marked: true };
      this.plan[d] = { txt: '休止', typ: "close" };
    } else if (!(this.day[d] && this.day[d].disable)) {
      if (this.day[d]) {
        Object.keys(this.day[d]).forEach(key => {
          if (key === "subTitle" || key === "marked") delete this.day[d][key];
        })
      }
      if (this.typ === 'price') {
        if (cal.price) {
          this.day[d] = { ...this.day[d], subTitle: `${cal.price}`, marked: true };
          this.plan[d] = { txt: cal.price, typ: "price" };
        } else if (cal.rate) {
          this.day[d] = { ...this.day[d], subTitle: `×${Math.floor(cal.rate / 100 * 100) / 100}`, marked: true };
          this.plan[d] = { txt: `${cal.rate}%`, typ: "rate" };
        }
      } else if (this.typ === 'minmax') {
        if (cal.min && cal.max) {
          this.day[d] = { ...this.day[d], subTitle: `${cal.min}-${cal.max}`, marked: true };
          this.plan[d] = { txt: `${cal.min}～${cal.max}`, typ: this.typ };
        }
      } else {
        if (cal[this.typ]) {
          this.day[d] = { ...this.day[d], subTitle: `${cal[this.typ]}`, marked: true };
          this.plan[d] = { txt: cal[this.typ], typ: this.typ };
        }
      }
    }
  }
  setDays() {
    this.days = [];
    Object.keys(this.day).forEach(d => {
      this.days.push({ date: new Date(d), ...this.day[d] });
    });
    let plans = [];
    Object.keys(this.plan).forEach(d => {
      if (this.plan[d].typ === "close" || this.plan[d].typ === this.typ || this.plan[d].typ === "rate" && this.typ === "price") {
        let date = new Date(d);
        plans.push({ date: new Date(date), day: date, time: date.getTime(), value: this.plan[d].txt });
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
    if (typ === "minmax") {
      this.calendar.min.markAsPristine(); this.calendar.max.markAsPristine();
    } else {
      this.calendar[typ].markAsPristine();
    }
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
        let calendar = typ === 'minmax' ? { ...this.data[date], min: this.calendar.min.value, max: this.calendar.max.value } : { ...this.data[date], [typ]: this.calendar[typ].value };
        this.setCalendar(d, calendar);
      }
    }
    this.setDays();
    this.change = true;
  }
  delPlan(plan) {
    const clear = (d: string) => {
      if (this.day[d].subTitle) delete this.day[d].subTitle;
      if (this.day[d].marked) delete this.day[d].marked;
      delete this.plan[d];
    }
    for (let date = new Date(plan.from); date <= plan.to; date.setDate(date.getDate() + 1)) {
      const d = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      if (this.typ === "minmax") {
        delete this.data[d].min;
        delete this.data[d].max;
      } else {
        delete this.data[d][this.plan[d].typ];
      }
      if (this.typ === 'price') {
        if (this.data[d].price) {
          this.day[d] = { ...this.day[d], subTitle: `${this.data[d].price}`, marked: true };
          this.plan[d] = { txt: this.data[d].price, typ: "price" };
        } else if (this.data[d].rate) {
          this.day[d] = { ...this.day[d], subTitle: `×${Math.floor(this.data[d].rate / 100 * 100) / 100}`, marked: true };
          this.plan[d] = { txt: `${this.data[d].rate}%`, typ: "rate" };
        } else {
          clear(d);
        }
      } else {
        clear(d);
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
        inserts.push({ dated: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, prop: this.prop, room: this.method, id: this.id, idx: idx, ...this.data[date] });
        idx++;
      }
    });
    this.api.post('querys', { table: "charge_calendar", delete: { prop: this.prop, room: this.method, id: this.id }, inserts: inserts }, '予定保存中...').then(res => {

    }).catch(() => {
      this.ui.alert('プランの保存に失敗しました。');
    }).finally(() => {
      this.modal.dismiss({ day: this.day, data: this.data });
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
