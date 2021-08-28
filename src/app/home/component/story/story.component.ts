import { Component, OnInit, OnChanges, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { ApiService } from '../../../service/api.service';
import { StateService } from '../../../service/state.service';
import { Observable } from 'rxjs';
import { UserComponent } from '../user/user.component';
import { APIURL } from '../../../../environments/environment';
@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
})
export class StoryComponent implements OnInit, OnChanges {
  @Input() user;
  @Input() page;
  @Input() param;//column,markerなど親ページの基本データ{id,na,user,txt?,img?,ack?,acked?}
  @Input() datas;//columnのみ、storyのデータを引き継ぐ
  @Output() isStory = new EventEmitter();//記事があるかどうか
  storys = [];
  user$: Observable<any>;
  view: any = {};//viewカウント重複防止
  res: any = {};
  constructor(private meta: Meta, private title: Title, private db: AngularFireDatabase, private api: ApiService,
    private state: StateService, private router: Router, private pop: PopoverController,) {
    this.res.storys = [];
  }
  ngOnInit() {
  }
  async ngOnChanges(changes: SimpleChanges) {
    if (changes.param && this.param.id) {
      const title = 'na' in this.param ? this.param.na : "ツーリングスティ";
      this.title.setTitle(title);
      const isServer = this.state.get('isServer');
      if (isServer === true) {
        this.meta.updateTag({ property: "og:title", content: title });
        this.meta.updateTag({ name: "twitter:text:title", content: title });
        const description = "ライダー、ドライバー、チャリダー全ての旅人が安心して滞在し、感動を分かち合える場所をオンラインとオフラインにつくります。";
        let txt = 'description' in this.param ? this.param.description : description;
        txt = 'txt' in this.param ? this.param.txt : txt;
        txt = txt ? txt : description;
        this.meta.updateTag({ property: "og:description", content: txt });
        this.meta.updateTag({ name: "description", content: txt });
        this.meta.updateTag({ property: "og:url", content: `https://${this.state.get('host')}/${this.page}/${this.param.id}` });
        const image = `${APIURL}img/pwa192.png`;
        let img = 'img' in this.param ? this.param.img : image;
        img = 'image' in this.param ? this.param.image : img;
        this.meta.updateTag({ property: "og:image", content: img ? img : image });
      } else if (isServer === false) {
        if (this.page === "essay") {
          this.res.storys = this.datas;
          if (!this.datas.length) { this.param.user = null; }
        } else {
          this.res = await this.api.get('query', {
            table: 'story',
            select: ['id', 'txt', 'media', 'file', 'rest', 'restdate', 'rested'],
            where: { typ: this.page, parent: this.param.id }
          });
        }
        this.user$ = this.param.user ? this.db.object(`user/${this.param.user}`).valueChanges() : null;
        if (this.res.storys.length) {
          this.isStory.emit(true);
          if (!(this.param.id in this.view) && Number(this.param.ack) === 1 && this.param.user && this.param.user !== this.user.id) {
            this.db.database.ref(`${this.page}/${this.param.id}/view`).transaction(val => {
              return (val || 0) + 1;
            });
            this.db.database.ref(`user/${this.param.user}/view`).transaction(val => {
              return (val || 0) + 1;
            });
            this.view[this.param.id] = "";
          }
        } else {
          this.isStory.emit(false);
        }
      }
    }
    let support: boolean = null;
    this.storys = await Promise.all(this.res.storys.map(async story => {
      if (story.rested) {//非公開の記事
        if (support || this.user.id === this.param.user) {//||this.user.admin
          story.rested = null;
        } else {
          if (support == null && this.user.id) {
            const doc = await this.db.database.ref(`friend/${this.user.id}/${this.param.user}`).once('value');
            support = doc.val() === "support" ? true : false;
          }
          if (support || new Date(story.rested).getTime() < new Date().getTime()) {
            story.rested = null;
          }
        }
      }
      return story;
    }));
  }
  support() {
    this.router.navigate(['/support/', this.param.user]);
  }
  async popUser() {
    const popover = await this.pop.create({
      component: UserComponent,
      componentProps: { id: this.param.user, self: this.user },
      cssClass: 'user'
    });
    return await popover.present();
  }
}
