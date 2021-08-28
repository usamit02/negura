import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StateService } from '../../../service/state.service';
import { UserService } from '../../../service/user.service';
import { APIURL } from '../../../../environments/environment';
import { User, USER, Prop, PROP } from '../../../class';
@Component({
  selector: 'app-facility',
  templateUrl: 'facility.page.html',
  styleUrls: ['facility.page.scss']
})
export class FacilityPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('slides', { static: false }) slides: IonSlides;
  @ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;
  @ViewChild('_story', { read: ElementRef, static: false }) story: ElementRef;
  @ViewChild('_chat', { read: ElementRef, static: false }) chat: ElementRef;
  user: User = USER;
  prop: Prop = PROP;
  imgs: Array<any> = [];
  txt: string = "";
  slideOpts = {
    initialSlide: 0, speed: 500, loop: true, slidesPerView: 1,
    autoplay: { delay: 3000, }
  }
  param = { id: null, na: "", txt: "", img: "", cursor: null };
  isStory: boolean;
  private onDestroy$ = new Subject();
  constructor(private userService: UserService, private state: StateService, private title: Title, private route: ActivatedRoute,
  ) { }
  ngOnInit() {
    this.state.select(state => state.prop).pipe(takeUntil(this.onDestroy$)).subscribe(prop => {
      this.prop = prop;
      this.title.setTitle(`${prop.na}の設備`);
      this.param.id = prop.id; this.param.na = prop.na;
      for (let i = 0; i < prop.txts.length; i++) {
        this.imgs.push({ url: `${APIURL}img/facility/${this.prop.id}/${i + 1}.jpg`, txt: prop.txts[i] });
      }
    })
    this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      this.user = user;
    })
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      if (params.cursor) this.param.cursor = params.cursor;
    });
  }
  ngAfterViewInit() {
  }
  slideChange(e) {
    this.slides.getActiveIndex().then(i => {
      if (i === 0) {
        i = this.prop.txts.length - 1;
      } else if (i > this.prop.txts.length) {
        i = 0;
      } else {
        i--;
      }
      this.txt = this.prop.txts[i];
    });
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
