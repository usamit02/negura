import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User,Prop, Charge, CHARGETYP } from '../../../../class';
@Component({
  selector: 'app-charges',
  templateUrl: './charges.component.html',
  styleUrls: ['./charges.component.scss'],
})
export class ChargesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: User;
  @Input() prop: Prop; 
  @Input() room: number;
  @Input() charges: Charge[];
  @Output() change = new EventEmitter();
  @Output() close = new EventEmitter();
  typs: Typ[];
  private onDestroy$ = new Subject();
  constructor(private router: Router) { }
  ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.user.id) {
      if (changes.charges && changes.charges.currentValue) {
        this.typs = [];
        const roomCharges = this.charges.filter(charge => { return charge.room === this.room; });
        Object.keys(CHARGETYP).forEach((typ) => {
          let charges = roomCharges.filter(charge => { return charge.typ === typ; });
          this.typs.push({ key: typ, na: CHARGETYP[typ].na, charges: charges, hide: false });
        });
      } else if (changes.room && this.charges && changes.room.currentValue) {
        const roomCharges = this.charges.filter(charge => { return charge.room === this.room; });
        for (let typ of this.typs) {
          typ.charges = roomCharges.filter(charge => { return charge.typ === typ.key; });
        }
      }
    } else {
      this.typs = [];
    }
  }
  reorder(i, e) {
    alert("並べ替え機能は後日実装します。");
    let temp = this.typs[i].charges[e.detail.from];
    this.typs[i].charges[e.detail.from] = this.typs[i].charges[e.detail.to];
    this.typs[i][e.detail.to] = temp;
    //this.api.post('column', { ids: JSON.stringify(this.columns.map(column => { return column.id; })) });
    e.detail.complete(true);
  }
  link(url, modeKeep?: boolean) {
    this.router.navigate([`/${url}`]);
    this.close.emit();
  }
  menuClose() {
    this.close.emit();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
interface Typ {
  key: string;
  na: string;
  charges: Charge[];
  hide: boolean;
}
