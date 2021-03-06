import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../service/api.service';
import { UiService } from '../../../service/ui.service';
import { APIURL } from '../../../../environments/environment';
import { User } from '../../../class';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
declare var Payjp;
@Component({
  selector: 'app-pay1',
  templateUrl: './pay1.component.html',
  styleUrls: ['./pay1.component.scss'],
})
export class Pay1Component implements OnInit, OnChanges {
  @Input() user: User;
  @Input() amount: number;
  @Input() amount0: number;
  @Output() pay = new EventEmitter();
  card = { last4: "", brand: "", exp_year: null, exp_month: null, change: false };
  cardNumber = new FormControl("4242424242424242", [Validators.pattern(/^(([0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4})|([0-9]{16}))$/), Validators.required]);
  cardCvc = new FormControl("123", [Validators.pattern(/^([0-9]{3})$/), Validators.required]);
  cardRimit = new FormControl("2025-6-1", Validators.required);
  cardForm = this.builder.group({
    cardNumber: this.cardNumber, cardCVC: this.cardCvc, cardRimit: this.cardRimit,
  });
  whatCvc: boolean = false;
  cardimg = APIURL + "img/visamaster.jpg"; cvcimg = APIURL + "img/cvc.jpg";
  options = [];
  method = "";
  apiLoaded: Observable<boolean>;
  constructor(http: HttpClient, private api: ApiService, private ui: UiService, private builder: FormBuilder,) {
    if (typeof Payjp === 'object') {
      this.apiLoaded = of(true);
    } else {
      this.apiLoaded = http.jsonp('https://js.pay.jp', 'callback').pipe(map(() => {
        Payjp.setPublicKey('pk_test_a77ab4464e1cecb66c3d1b21');
        console.log('jsonp apiLoaded');
        return true;
      }), catchError(() => {
        console.log('jsonp catchError');
        Payjp.setPublicKey('pk_test_a77ab4464e1cecb66c3d1b21');//"pk_live_087f0146e09e1f1eceaf0750");https://js.pay.jp/
        return of(true);
      }))
    }
  }
  ngOnInit() {
    //Payjp.setPublicKey('pk_test_a77ab4464e1cecb66c3d1b21');//"pk_live_087f0146e09e1f1eceaf0750");
  }
  ngOnChanges() {
    this.api.get('card', { uid: this.user.id, na: this.user.na }).then(res => {
      this.card = res.card;
    }).catch(() => {
      this.ui.alert(`???????????????????????????????????????`);
    });
    if (this.amount) {
      this.method = this.amount0 ? "??????" : "??????";
    } else {
      this.method = this.amount0 ? "???????????????" : "";
    }
  }
  newpay() {
    this.ui.loading("?????????????????????");
    let d = new Date(this.cardRimit.value);
    let y = d.getFullYear();
    let m = d.getMonth() + 1;
    let card = { number: this.cardNumber.value.replace(/-/g, ''), cvc: this.cardCvc.value, exp_month: m, exp_year: y };
    Payjp.createToken(card, (s, res) => {
      this.ui.loadend();
      if (res.error) {
        this.ui.alert("???????????????????????????????????????????????????????????????");
      } else {
        this.payClick(res.id);
      }
    });
  }
  payClick(token: string) {
    this.pay.emit(token);
  }
  dateFormat(date = new Date()) {//MySQL????????????????????????'yyyy-M-d H:m:s'    
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + "-" + m + "-" + d;//+ " " + h + ":" + min + ":" + sec;
  }
}
