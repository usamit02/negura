import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from './../service/state.service';
import { UserService } from '../service/user.service';
import { User, USER, Prop, PROP } from '../class';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  prop: Prop = PROP;
  user: User = USER;
  private onDestroy$ = new Subject();
  constructor(private state: StateService, private userService: UserService, public menu: MenuController) {
  }
  ngOnInit() {
    this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe((prop: Prop) => {
      this.prop = prop;
    })
    this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe((user: User) => {
      this.user = user;
    });
  }
  logout() {
    this.userService.logout();
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
