import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { HomeService } from './home.service';
import { StateService } from './../../service/state.service';
import { UserService } from '../../service/user.service';
import { User, USER, Prop, PROP, Room, Charge, RoomTyp } from '../../class';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  prop: Prop = PROP;
  user: User = USER;
  room: number;
  rooms: Room[];
  charges: Charge[];
  private onDestroy$ = new Subject();
  constructor(private state: StateService, private userService: UserService, public menu: MenuController, public home: HomeService,) {
  }
  ngOnInit() {
    this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe((prop: Prop) => {
      this.prop = prop;
      this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe((user: User) => {
        if (user.id && user.id !== this.user.id) {
          this.home.load(prop.id).then(data => {
            this.rooms = data.rooms;
            this.charges = data.charges;
          })
        }
        this.user = user;
      });
    })
    this.home.room$.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(room => {
      this.room = room;
    });
    this.home.rooms$.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(rooms => {
      this.rooms = rooms.map(room => { return room; });//app-menuのinput changesを発火させるため、内容が同じ新配列を生成
    });
  }
  change(typ: string, e) {
    this.home[typ].next(e);
    console.log(`change ${typ} ${e}`);
  }
  logout() {
    this.userService.logout();
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
