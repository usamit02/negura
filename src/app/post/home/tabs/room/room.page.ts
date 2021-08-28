import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { ROOM, User, USER, Prop, PROP } from '../../../../class';
import { ROOMTYPS, PROPS } from '../../../../config';
import { UserService } from '../../../../service/user.service';
import { ApiService } from '../../../../service/api.service';
import { StateService } from '../../../../service/state.service';
import { UiService } from '../../../../service/ui.service';
import { HomeService } from '../../home.service';
import { APIURL } from '../../../../../environments/environment';
import { PlanComponent } from './plan/plan.component';
import { OtaComponent } from './ota/ota.component';
@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage implements OnInit, OnDestroy {
  @ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;
  @ViewChild('basic', { read: ElementRef, static: false }) basic: ElementRef;
  //@ViewChild('plan', { read: ElementRef, static: false }) plan: ElementRef;
  @ViewChild('essay', { read: ElementRef, static: false }) essay: ElementRef;
  @ViewChild('canvas', { read: ElementRef, static: false }) canvas: ElementRef;
  user: User = USER;
  id: number = null;
  prop: Prop = PROP;
  ROOM = { typ: 0, na: "", txt: "", img: "", price: 0, close: 0, chat: 1, beds24: 0, beds24id: null, qty: 1, size: 0, max_people: 1 };
  room = {
    typ: new FormControl(this.ROOM.typ, [Validators.required]),
    na: new FormControl(this.ROOM.na, [Validators.minLength(2), Validators.maxLength(20), Validators.required]),
    txt: new FormControl(this.ROOM.txt, [Validators.minLength(0), Validators.maxLength(600)]),
    img: new FormControl(this.ROOM.img), simg: new FormControl(this.ROOM.img), limg: new FormControl(this.ROOM.img),
    price: new FormControl(this.ROOM.price, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$'), Validators.required]),
    close: new FormControl(this.ROOM.close), chat: new FormControl(this.ROOM.chat), beds24: new FormControl(this.ROOM.beds24),
    beds24id: new FormControl(this.ROOM.beds24id, [Validators.min(0), Validators.max(1000000), Validators.pattern('^[0-9]+$')]),
    qty: new FormControl(this.ROOM.qty, [Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]+$'), Validators.required]),
    size: new FormControl(this.ROOM.size, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
    max_people: new FormControl(this.ROOM.max_people, [Validators.min(0), Validators.max(100), Validators.pattern('^[0-9]+$'), Validators.required]),
  }
  roomForm = this.builder.group({
    typ: this.room.typ, na: this.room.na, txt: this.room.txt, img: this.room.img, simg: this.room.simg, price: this.room.price,
    close: this.room.close, chat: this.room.chat, beds24: this.room.beds24, beds24id: this.room.beds24id, qty: this.room.qty, size: this.room.size, max_people: this.room.max_people,
  });
  roomTyps = [];
  imgBlob;
  noimgUrl = APIURL + 'img/noimg.jpg';
  saving = false;
  editable: boolean = false;
  planCache = { day: {}, data: {}, otas: [] };//プランカレンダーとOTAのキャッシュ
  currentY: number; scrollH: number; contentH: number; planY: number; basicY: number; essayY: number;
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private api: ApiService, private home: HomeService,
    private state: StateService, private ui: UiService, private builder: FormBuilder, private storage: AngularFireStorage,
    private alert: AlertController, private db: AngularFireDatabase, private storedb: AngularFirestore, private modal: ModalController,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(async user => {
        if (user.id) {
          if (this.user.id !== user.id) {
            this.prop = this.state.get('prop');
            this.editable = this.prop.users.filter(u => { return u === user.id; }).length === 1 ? true : false;
            if (params.id) {
              this.id = Number(params.id);
              this.roomTyps = ROOMTYPS.filter(typ => { return this.prop.roomTyps.includes(typ.id); });
              this.home.room$.next(this.id); console.log(`room$ next ${this.id}`);
              this.home.load$.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(load => {
                if (load) { this.undo(); };
              })
            } else if (params.typ) {
              this.create({ prop: this.prop.id, na: "新しい部屋", typ: Number(params.typ) }).then(id => {
                this.router.navigate([`/post/room`, id]);
              });
            }
          }
        } else {
          this.editable = false;
          //this.router.navigate(['login']);
        }
        this.user = user;
      });
    });
    this.home.room$.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(room => {
      console.log(`room$ in room page fire ${room}`);
      if (room && this.id && room !== this.id) {
        this.id = room;
        this.undo();
      }
    })
    let charge$ = this.home.charge$.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(charge => {
      console.log(`charge$ in room page fire ${charge}`);
      if (charge) {
        charge$.unsubscribe();
        this.router.navigate([`/post/charge`, this.prop.id, this.id, charge]);
      }
    })
  }
  undo() {
    let rooms = this.home.data.rooms.filter(room => { return room.id === this.id; });
    if (rooms.length) {
      this.roomForm.patchValue(rooms[0]);
      this.roomForm.markAsPristine();
    } else {
      alert("無効なparam.idです。");
    }
  }
  imgChange(e) {
    if (e.target.files[0].type.match(/image.*/)) {
      this.imgBlob = window.URL.createObjectURL(e.target.files[0]);
      this.roomForm.markAsDirty();
    } else {
      this.ui.pop("画像ファイルjpgまたはpngを選択してください。");
    }
  }
  async modalPlan(typ: string) {
    const modal = await this.modal.create({
      component: PlanComponent,
      componentProps: { prop: this.prop.id, room: { ...this.roomForm.value, id: this.id }, param: { ...this.planCache, typ: typ } },
    });
    return await modal.present().then(() => {
      modal.onDidDismiss().then(event => {
        if (event.data) this.planCache = event.data;
      });
    });;
  }
  async modalbeds24() {
    if (!this.saving && this.room.beds24.value) {
      const modal = await this.modal.create({
        component: OtaComponent,
        componentProps: { prop: this.prop.id, room: { ...this.roomForm.value, id: this.id }, otas: this.planCache.otas },
      });
      return await modal.present().then(() => {
        modal.onDidDismiss().then(event => {
          if (event.data) {
            this.planCache.otas = event.data;
          }
        });
      });;
    }
  }
  async save() {
    if (this.editable) {
      if (this.roomForm.dirty) {
        this.saving = true;
        this.ui.loading('保存中...');
        let update: any = { prop: this.prop.id, ...this.roomForm.value };
        if (this.imgBlob) {
          if (!HTMLCanvasElement.prototype.toBlob) {//edge対策
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
              value: function (callback, type, quality) {
                let canvas = this;
                setTimeout(function () {
                  var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]),
                    len = binStr.length,
                    arr = new Uint8Array(len);
                  for (let i = 0; i < len; i++) {
                    arr[i] = binStr.charCodeAt(i);
                  }
                  callback(new Blob([arr], { type: type || 'image/jpeg' }));
                });
              }
            });
          }
          const imagePut = (id: number, typ: string) => {
            return new Promise<string>(resolve => {
              if (!this.imgBlob) return resolve("");
              let canvas: HTMLCanvasElement = this.canvas.nativeElement;
              let ctx = canvas.getContext('2d');
              let image = new Image();
              image.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const px = typ == 'small' ? 160 : 640;
                let w, h;
                if (image.width > image.height) {
                  w = image.width > px ? px : image.width;//横長
                  h = image.height * (w / image.width);
                } else {
                  h = image.height > px * 0.75 ? px * 0.75 : image.height;//縦長
                  w = image.width * (h / image.height);
                }
                canvas.width = w; canvas.height = h;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async blob => {
                  const ref = this.storage.ref(`room/${id}/${typ}.jpg`);
                  await ref.put(blob);
                  const url = await ref.getDownloadURL().toPromise();
                  return resolve(url);
                }, "image/jpeg")
              }
              image.src = this.imgBlob;
            });
          }
          update.img = await imagePut(this.id, "medium");
          update.simg = await imagePut(this.id, "small");
        }
        this.api.post('query', { table: "room", update: update, where: { id: this.id } }).then(async () => {/*
          let calendar = await this.api.get('query', { table: "room_calendar", select: ["*"], where: { room: this.id } });
          if (calendar.room_calendars.length) {
            calendar.room_calendars.map(calendar => {

              return calendar;
            });
          }
          let dates:any = {};
          let res = await this.api.post('beds24', { json: "setRoomDates", param: { roomId: this.room.beds24, dates: dates } });
          console.log(res);
          if (res.msg !== "ok") throw (res.roomDates[0].error);*/
          for (let i = 0; i < this.home.data.rooms.length; i++) {
            if (this.home.data.rooms[i].id === this.id) {
              this.home.data.rooms[i] = { ...this.home.data.rooms[i], ...update };
              break;
            }
          }
        }).catch(() => {
          this.ui.alert(`保存に失敗しました。`);
        }).finally(() => {
          this.saving = false;
          this.roomForm.markAsPristine();
          this.ui.loadend();
        })
      }
    } else {
      this.ui.popm('保存するには権限を持つユーザーでログインしてください。');
      if (!this.user.id) this.router.navigate(['login']);
    }
  }
  async new() {
    const alert = await this.alert.create({
      header: '新しい滞在プランを作成',
      message: '現在の内容を元にして新しい滞在プランを作成しますか。<br>「いいえ」で現在の編集内容を破棄します。',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'いいえ',
          handler: () => {
            this.create({ prop: this.prop.id, na: "新しい部屋" });
          }
        }, {
          text: 'はい',
          handler: () => {
            this.create({ prop: this.prop.id, ...this.roomForm.value }, true);
          }
        }
      ]
    });
    await alert.present();
  }
  create(insert, copy?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.editable) {
        this.api.post("query", { table: "room", insert: insert }).then(async res => {
          if (copy && res.room) {
            let doc = await this.api.get('query', { table: "story", select: ["*"], where: { typ: "room", parent: this.id } });
            if (doc.storys.length) {
              doc.storys.map(story => {
                story.parent = res.room.id;
                return story;
              });
              await this.api.post('querys', { table: "story", inserts: doc.storys });
            }
            let calendar = await this.api.get('query', { table: "room_calendar", select: ["*"], where: { room: this.id } });
            if (calendar.room_calendars.length) {
              calendar.room_calendars.map(calendar => {
                calendar.room = res.room.id;
                return calendar;
              });
              let room_calendar = await this.api.post('querys', { table: "room_calendar", inserts: calendar.room_calendars });
              for (let cal of room_calendar.room_calendar) {
                this.home.data.room_calendars.push(cal);
              }
            }
          }
          this.home.data.rooms.push(res.room);
          this.id = res.room.id;
          this.home.rooms$.next(this.home.data.rooms);
          this.undo();
          resolve(this.id);
        }).catch(err => {
          this.ui.alert(`新規滞在プランの作成に失敗しました。\r\n${err.message}`);
          reject();
        });
      } else {
        this.ui.popm('作成するには権限を持つユーザーでログインしてください。');
        if (!this.user.id) this.router.navigate(['login']);
        reject();
      }
    })
  }
  async erase() {
    if (this.editable) {
      const confirm = await this.ui.confirm("削除確認", `滞在プラン「${this.room.na.value}」を削除します。`);
      if (!confirm || !this.id) return;
      this.ui.loading('削除中...');
      this.api.get('query', { table: 'story', select: ['file'], where: { typ: 'room', parent: this.id } }).then(async res => {
        for (let story of res.storys) {
          if (story.file) this.storage.ref(`room/${this.id}/${story.file}`).delete();
        }
        await this.api.post('querys', { deletes: [{ parent: this.id, typ: 'room', table: "story" }, { room: this.id, table: "room_calendar" }, { room: this.id, table: "beds24ota" }, { id: this.id, table: "room" }] });
        await this.db.list(`room/${this.id}`).remove();
        await this.db.database.ref(`post/room${this.id}`).remove();
        await this.storedb.collection('room').doc(this.id.toString()).delete();
        if (this.room.img.value) {
          await this.storage.ref(`room/${this.id}/medium.jpg`).delete();
          await this.storage.ref(`room/${this.id}/small.jpg`).delete();
        }
        this.home.data.rooms = this.home.data.rooms.filter(room => { return room.id !== this.id; });
        this.home.data.room_calendars = this.home.data.room_calendars.filter(calendar => { return calendar.room !== this.id; });
        this.home.rooms$.next(this.home.data.rooms);
        this.roomForm.reset();
        this.ui.pop("滞在プランを削除しました。");
      }).catch(err => {
        this.ui.alert(`滞在プランを削除できませんでした。\r\n${err.message}`);
      }).finally(() => { this.ui.loadend(); });
    } else {
      this.ui.popm('削除するには権限を持つユーザーでログインしてください。');
      if (!this.user.id) this.router.navigate(['login']);
    }
  }
  async onScrollEnd() {
    const content = await this.content.nativeElement.getScrollElement();
    this.currentY = content.scrollTop;
    this.contentH = content.offsetHeight;
    this.scrollH = content.scrollHeight;
    this.basicY = this.basic.nativeElement.offsetTop;
    //this.planY = this.plan.nativeElement.offsetTop;
    this.essayY = this.essay.nativeElement.offsetTop;
  }
  scroll(target) {
    this.content.nativeElement.scrollToPoint(0, target, 500);
  }
  dateFormat(date = new Date()) {//MySQL用日付文字列作成'yyyy-M-d H:m:s'
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    return y + "-" + m + "-" + d + " " + h + ":" + min + ":" + sec;
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}