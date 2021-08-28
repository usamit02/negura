import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-hold',
  templateUrl: './hold.component.html',
  styleUrls: ['./hold.component.scss'],
})
export class HoldComponent implements OnInit, OnChanges {
  @Input() amount: number;  
  @Input() amount0: number;
  @Output() pay = new EventEmitter();
  method =""
  constructor() {
    
  }
  ngOnInit() {

  }
  ngOnChanges(changes) {
    if(this.amount){
      this.method = this.amount0 ? "変更":"予約";
    }else{
      this.method = this.amount0 ? "キャンセル":"";
    }
  }
  hold() {
    this.pay.emit('hold');
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'    
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + "-" + m + "-" + d;//+ " " + h + ":" + min + ":" + sec;
  }
}
