import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User, USER,Prop, Room } from '../../../../class';
import { ROOMTYPS } from '../../../../config';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() user: User = USER;
  @Input() prop: Prop;
  @Input() rooms: Room[];
  @Input() room: number;
  @Output() change = new EventEmitter();
  @Output() close = new EventEmitter();
  typs: Typ[];
  private onDestroy$ = new Subject();
  constructor(private router: Router) { }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.user.id) {
      if (changes.rooms && changes.rooms.currentValue) {
        if (changes.rooms.previousValue) {
          for (let typ of this.typs) {
            typ.rooms = this.rooms.filter(room => { return room.typ === typ.id; });
          }
        } else {
          this.typs = [];
          this.typs = this.prop.roomTyps.map(typ => {
            let rooms = this.rooms.filter(room => { return room.typ === typ; });
            return { id: typ, na: ROOMTYPS.filter(roomTyp => { return roomTyp.id === typ })[0].na, rooms: rooms, hide: false };
          })
        }
      }
    } else {
      this.typs = [];
    }
  }
  reorder(i, e) {
    alert("並べ替え機能は後日実装します。");
    let temp = this.typs[i].rooms[e.detail.from];
    this.typs[i].rooms[e.detail.from] = this.typs[i].rooms[e.detail.to];
    this.typs[i][e.detail.to] = temp;
    //this.api.post('column', { ids: JSON.stringify(this.columns.map(column => { return column.id; })) });
    e.detail.complete(true);
  }
  link(url) {
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
  id: number;
  na: string;
  rooms: Room[];
  hide: boolean;
}