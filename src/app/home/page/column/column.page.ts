import { Component, OnInit, OnDestroy, ViewChild, ElementRef, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../service/api.service';
import { UserService } from '../../../service/user.service';
@Component({
  selector: 'app-column',
  templateUrl: './column.page.html',
  styleUrls: ['./column.page.scss'],
})
export class ColumnPage implements OnInit, OnDestroy {
  //@ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;  
  @ViewChild('_story', { read: ElementRef, static: false }) story: ElementRef;
  param = { id: null, topInfinite: false };
  column: Column = { parent: 0, id: null, na: "", kana: "", user: null, image: "", description: "", ack: null, created: null, acked: null, ackuser: null, rest: null, chat: null };
  storys = [];
  columns: Column[] = [];//配下のカラム
  user;
  isStory: boolean;
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private api: ApiService, private userService: UserService,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.param.id = params.id; this.load();
    });
    this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      this.user = user; this.load();
    });
  }
  load() {
    if (!this.user) return;
    this.api.get('column', { id: this.param.id, uid: this.user.id }).then(res => {
      this.storys = res.storys.map(story => {
        story.txt = `<p>　${story.txt}</p>`;
        return story;
      });
      this.param.topInfinite = this.storys.length ? false : true;
      this.columns = res.columns;
      this.column = res.column;
    });
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
interface Column {
  id: number;
  parent: number;
  idx?: number;
  user: string;
  na: string;
  kana: string;
  image: string;
  description: string;
  ack: number;
  created: Date;
  acked: Date;
  ackuser: string;
  rest: boolean;
  chat: boolean;
  lock?: boolean;
}
