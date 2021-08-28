import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';
import { UiService } from '../../../service/ui.service';
import { StateService } from '../../../service/state.service';
import { UserService } from '../../../service/user.service';
import { User, USER, Prop,CHARGETYP } from '../../../class';
@Component({
  selector: 'app-charge',
  templateUrl: './charge.component.html',
  styleUrls: ['./charge.component.scss'],
})
export class ChargeComponent implements OnInit, OnDestroy {
  prop: Prop;
  room: number;
  typs;
  user: User = USER;
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private router: Router, private state: StateService, private userService: UserService, private api: ApiService, private ui: UiService,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {//this.route.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.room = params.id;
      this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe((prop: Prop) => {
        this.prop = prop;
        this.typs = [];
        Object.keys(CHARGETYP).forEach(key => {
          this.typs.push({ key: key, ...CHARGETYP[key] });
        })
        this.api.get('query', { select: ['*'], table: 'charge', where: { prop: this.prop.id, room: { or: -1, or1: 0, or2: this.room } }, order: { id: "", room: "" } }, `設定読込中...`).then(res => {
          let charges = [];
          let allCharges = res.charges.filter(charge => { return charge.room === -1; });
          let charges1 = res.charges.filter(charge => { return charge.room !== -1; });
          charges1.map((charge, i, array) => {
            if (!(charge.room === 0 && i < array.length - 1 && array[i + 1].id === charge.id)) { charges.push({ ...charge }) };
            return charge;
          })
          this.typs.map(typ => {
            typ.allCharges = allCharges.filter(charge => { return charge.typ === typ.key; });
            typ.charges0 = res.charges.filter(charge => { return charge.typ === typ.key; });
            typ.charges = charges.filter(charge => { return charge.typ === typ.key; });
            return typ;
          })
        }).catch(err => {
          this.ui.alert(`料金設定の読み込みに失敗しました。\r\n${err.message}`);
        })
      })
      this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe((user: User) => {
        this.user = user;
      });
    })
  }
  add(typ) {
    this.router.navigate(['/post/charge', this.prop.id, this.room, typ.key]);
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
