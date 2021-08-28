import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../service/api.service';
import { UiService } from '../../../../service/ui.service';
import { User,CHARGETYP } from '../../../../class';
import { Unit } from './class';
@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
})
export class UnitComponent implements OnInit {
  @Input() unit: Unit;
  @Input() user: User;
  @Input() charge;
  form: FormGroup;
  control = {};
  units: Unit[] = [];//ユーザーごとに保存してあるユニットパターン
  value: Unit = new Unit();
  segment: any = {};
  unitStr: any = {};
  sizeStr = "";
  unitTyp = CHARGETYP;
  constructor(private api: ApiService, private ui: UiService, private builder: FormBuilder, public modal: ModalController,) { }
  ngOnInit() {
    this.charge = Object.keys(this.charge).length ? this.charge : CHARGE;
    Object.keys(this.charge).forEach(id => {
      const charge = this.charge[id];
      if (CHARGETYP[charge.typ].control === "input") {
        this.control[id] = new FormControl(null, [Validators.min(charge.min), Validators.max(charge.max), Validators.pattern('^[0-9.]+$')]);
      } else if (CHARGETYP[charge.typ].control === "segment") {
        const segment = { id: id, na: this.charge[id].na, icon: this.charge[id].icon }
        if (!this.control[charge.typ]) {
          this.control[charge.typ] = this.builder.array([]);
          this.segment[charge.typ] = [segment];
        } else {
          this.segment[charge.typ].push(segment);
        }
      }
      //this.charge[charge.key] = { price: charge.price, size: charge.size };
    });
    this.form = this.builder.group(this.control);
    if (this.user.id) {
      this.api.get('query', { select: ['*'], table: 'user_unit', where: { user: this.user.id }, order: { na: "" } }).then(res => {
        let items: number[];
        for (let i = 0; i < res.user_units.length; i++) {
          const id = res.user_units[i].id;
          items.push(id);/*         
          let charges = this.charges.filter(charge => { return charge.key === res.units[i].key });
          if (charges.length) {
            items.push({ key: charges[0].key, price: charges[0].price, size: charges[0].size });
          }*/
          if (i === res.user_units.length - 1 || res.user_units[i].na !== res.user_units[i + 1].na)
            this.units.push(new Unit(items, res.user_units[i].na));
        }
        this.load(this.units.length ? this.units[0] : this.unit);
      }).catch(err => {
        this.ui.alert(`団体の読み込みに失敗しました。\r\n${err.message}`);
      })
    } else {
      this.load(this.unit);
    }
  }
  load(unit: Unit) {
    this.value = new Unit(unit.items);
    this.form.patchValue(this.value.typ('people', this.charge));
    Object.keys(this.form.controls).forEach(typ => {
      for (let item of unit.items.filter(item => { return this.charge[item].typ === typ })) {
        this.add(typ, item)
      }
    })
    this.form.markAsPristine();
  }
  change() {
    this.setValue();
    this.form.markAsDirty();
  }
  get(key: string): FormArray {
    return this.form.get(key) as FormArray;
  }
  add(typ: string, id?: number) {
    (this.form.get(typ) as FormArray).push(this.builder.group({ id: new FormControl(id), }));
    this.setValue();
    this.form.markAsDirty();
  }
  del(typ: string, i: number) {
    (this.form.get(typ) as FormArray).removeAt(i);
    this.setValue();
    this.form.markAsDirty();
  }
  inc(control: FormControl, val: number) {
    control.setValue(Math.round((Number(control.value) + val) * 100) / 100);
    control.markAsDirty();
  }
  nosort(){
    return 0;//ngFor keyvalueでkeyによる自動並べ替えを無効にする。
  }
  setValue(unit?: Unit) {
    if (unit) {
      this.value = new Unit(unit.items)
    } else {
      let items: number[] = [];
      Object.keys(this.control).forEach(key => {
        if (CHARGETYP[key]) {//UNITTYP[UNITITEM[key].typ].control === "input"
          for (let arr of (this.form.get(key) as FormArray).value) {
            if (arr.id) { items.push(Number(arr.id)); }//({ key: arr.key, price: this.charge[arr.key].price, size: this.charge[arr.key].size });
          }
        } else {
          for (let i = 0; i < this.form.controls[key].value; i++) {
            items.push(Number(key));//({ key: key, price: this.charge[key].price, size: this.charge[key].size });
          }
        }
      })
      this.value = new Unit(items);
    }
    this.unitStr = this.value.toString(this.charge);
    this.sizeStr = this.value.size(this.charge).toString();
  }
  save() {
    if (this.form.dirty && this.user.id) {
      let inserts = [];
      Object.keys(this.control).forEach(typ => {

      })
      //inserts.push({ idx: i, room: this.room.id, prop: this.prop, ...this.rows.controls[i].value });

      this.api.post('querys', { table: "user_unit", delete: { user: this.user.id }, inserts: inserts }).then(res => {

      }).catch(() => {
        this.ui.alert('設定の保存に失敗しました。');
      }).finally(() => {
        this.modal.dismiss(this.value);
      });
    } else {
      this.modal.dismiss(this.value);
    }
  }
}

const CHARGE = {
  1: { typ: "people", min: 0, max: 10, price: 0, size: 0, qty: 9999 },
  2: { typ: "vehicle", min: 0, max: 10, price: 0, size: 0, qty: 9999 },
  3: { typ: "people", min: 0, max: 10, price: 0, size: 0, qty: 9999 },
  4: { typ: "vehicle", min: 0, max: 10, price: 0, size: 0, qty: 9999 }
}
/*
const CHARGES = [
  { key: "adult", typ: "people", min: 0, max: 10, price: 0, size: 0 },
  { key: "child", typ: "people", min: 0, max: 10, price: 0, size: 0 },
  { key: "car", typ: "vehicle", min: 0, max: 10, price: 0, size: 0 },
  { key: "motorcycle", typ: "vehicle", min: 0, max: 10, price: 0, size: 0 }
]*/