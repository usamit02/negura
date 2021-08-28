import { Component ,OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from '../../../service/state.service';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  prop;
  room: number;  
  private onDestroy$ = new Subject();
  constructor(private state: StateService, private home: HomeService,) { }
  ngOnInit() {
    this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe((prop) => {
      this.prop = prop;
    })
    this.home.room$.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(room => {
      this.room = room;
    })
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}

