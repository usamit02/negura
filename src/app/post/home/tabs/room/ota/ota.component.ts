import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormControl, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../service/api.service';
import { UiService } from '../../../../../service/ui.service';
@Component({
  selector: 'app-ota',
  templateUrl: './ota.component.html',
  styleUrls: ['./ota.component.scss'],
})
export class OtaComponent implements OnInit {
  @Input() room: any;
  @Input() prop: number;
  @Input() otas: Ota[];
  public form: FormGroup;
  constructor(private api: ApiService, private ui: UiService, private builder: FormBuilder, public modal: ModalController,) { }
  ngOnInit() {
    this.form = this.builder.group({ rows: this.builder.array([]) });
    if (this.otas.length) {
      this.load(this.otas);
    } else {
      this.ui.loading(`設定読込中...`);
      this.api.get('query', { select: ['*'], table: 'beds24ota', where: { room: this.room.id } }).then(res => {
        this.load(res.beds24otas);
      }).catch(err => {
        this.ui.alert(`施設情報の読み込みに失敗しました。\r\n${err.message}`);
      }).finally(() => {
        this.ui.loadend();
      });
    }
  }
  load(otas) {
    for (let i = 0; i < otas.length; i++) {
      this.addOta(otas[i])
    }
  }
  get rows(): FormArray {
    return this.form.get('rows') as FormArray;
  }
  addOta(row?: Row) {
    if (row == null) row = ROW;
    this.rows.push(this.builder.group(
      {
        na: new FormControl(row.na, [Validators.minLength(2), Validators.maxLength(20), Validators.required]),
        close: new FormControl(row.close),//weeks:new FormControl(['0']),    
        qty: new FormControl(row.qty, [Validators.min(-100), Validators.max(100), Validators.pattern('^[0-9.]+$')]),
        price: new FormControl(row.price, [Validators.min(-100000), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
        rate: new FormControl(row.rate, [Validators.min(0), Validators.max(10), Validators.pattern('^[0-9.]+$')]),
      }
    ))
  }
  delOta(i: number) {
    this.rows.removeAt(i);
  }
  inc(row, typ, val: number) {
    let control: FormControl = row.controls[typ];
    control.setValue(Math.round((Number(control.value) + val) * 100) / 100);
    control.markAsDirty();
  }
  save() {
    let inserts = [];
    //(this.form.get('rows') as FormArray)
    for (let i = 0; i < this.rows.controls.length; i++) {
      inserts.push({ idx: i, room: this.room.id, prop: this.prop, ...this.rows.controls[i].value });
    }
    this.api.post('querys', { table: "beds24ota", delete: { room: this.room.id }, inserts: inserts }, '設定保存中...').then(res => {
      if (res.msg === "ok") {
        this.otas = res.beds24otas;
      } else {
        throw (res.msg);
      }
    }).catch(() => {
      this.ui.alert('beds24設定の保存に失敗しました。');
    }).finally(() => {
      this.modal.dismiss({ otas: this.otas });
    });
  }
}
interface Ota {
  room: number;
  id: number;
  idx: number;
  na: string;
  price: number;
  rate: number;
  qty: number;
  close: number;
  prop: number;
}
interface Row {
  room?: number;
  id?: number;
  idx?: number;
  na: string;
  price: number;
  rate: number;
  qty: number;
  close: number;
  prop?: number;
}
const ROW = { na: '', price: 0, rate: 1, qty: 0, close: 0 }