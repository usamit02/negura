import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { User, USER, Charge, CHARGETYP } from '../../../../class';
import { PROPS } from '../../../../config';
import { UserService } from '../../../../service/user.service';
import { ApiService } from '../../../../service/api.service';
import { UiService } from '../../../../service/ui.service';
import { HomeService } from '../../home.service';
import { APIURL } from '../../../../../environments/environment';
import { PlanComponent } from './plan/plan.component';
@Component({
  selector: 'app-charge',
  templateUrl: './charge.page.html',
  styleUrls: ['./charge.page.scss'],
})
export class ChargePage implements OnInit, OnDestroy {
  @ViewChild('content', { read: ElementRef, static: false }) content: ElementRef;
  @ViewChild('basic', { read: ElementRef, static: false }) basic: ElementRef;
  @ViewChild('plan', { read: ElementRef, static: false }) plan: ElementRef;
  @ViewChild('essay', { read: ElementRef, static: false }) essay: ElementRef;
  @ViewChild('canvas', { read: ElementRef, static: false }) canvas: ElementRef;
  user: User = USER;
  id: number = null;
  prop: number = null;
  room: number = null;
  METHOD;
  method: number = null;//-1 or 0 or room  share or standard or uniqe
  CHARGE = { typ: null, na: null, txt: "", ext: "", img: "", price: null, min: null, max: null, chat: 1, qty: null, size: null, close: false };
  charge = {
    typ: new FormControl(this.CHARGE.typ, [Validators.required]),
    na: new FormControl(this.CHARGE.na, [Validators.minLength(1), Validators.maxLength(20), Validators.required]),
    txt: new FormControl(this.CHARGE.txt, [Validators.minLength(0), Validators.maxLength(600)]),
    ext: new FormControl(this.CHARGE.ext, [Validators.minLength(1), Validators.maxLength(5)]),
    img: new FormControl(this.CHARGE.img), simg: new FormControl(this.CHARGE.img), limg: new FormControl(this.CHARGE.img),
    price: new FormControl(this.CHARGE.price, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
    min: new FormControl(this.CHARGE.min, [Validators.min(0), Validators.max(1000), Validators.pattern('^[0-9]+$')]),
    max: new FormControl(this.CHARGE.max, [Validators.min(0), Validators.max(1000), Validators.pattern('^[0-9]+$')]),
    chat: new FormControl(this.CHARGE.chat), close: new FormControl(this.CHARGE.close),
    qty: new FormControl(this.CHARGE.qty, [Validators.min(0), Validators.max(9999), Validators.pattern('^[0-9]+$'), Validators.required]),
    size: new FormControl(this.CHARGE.size, [Validators.min(0), Validators.max(100000), Validators.pattern('^[0-9]+$')]),
  }
  chargeForm = this.builder.group({
    typ: this.charge.typ, na: this.charge.na, txt: this.charge.txt, ext: this.charge.ext, img: this.charge.img, simg: this.charge.simg, price: this.charge.price,
    min: this.charge.min, max: this.charge.max, chat: this.charge.chat, close: this.charge.close, qty: this.charge.qty, size: this.charge.size,
  });
  charges: Charge[] = [];
  chargeTyps = [];
  imgBlob;
  noimgUrl = APIURL + 'img/noimg.jpg';
  saving = false;
  editable: boolean = false;
  planCache = { day: {}, data: {} };//プランカレンダーのキャッシュ
  title: string = "";
  currentY: number; scrollH: number; contentH: number; planY: number; basicY: number; essayY: number;
  private onDestroy$ = new Subject();
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService, private api: ApiService,
    private ui: UiService, private builder: FormBuilder, private storage: AngularFireStorage, private alert: AlertController,
    private db: AngularFireDatabase, private store: AngularFirestore, private modal: ModalController, private home: HomeService,) { }
  ngOnInit() {
    this.route.params.pipe(takeUntil(this.onDestroy$)).subscribe(params => {
      this.id = Number(params.id);
      this.room = Number(params.room);
      this.prop = Number(params.prop);
      this.METHOD = { [-1]: "共有", [0]: "標準", [this.room]: "個別" };
      if (params.id && params.room && params.prop) {
        this.userService.$.pipe(takeUntil(this.onDestroy$)).subscribe(async user => {
          if (user.id) {
            if (user.id !== this.user.id) {
              this.editable = PROPS.filter(prop => { return prop.id === this.prop })[0].users.filter(u => { return u === user.id; }).length === 1 ? true : false;
              if (this.id) {
                this.home.load$.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(load => {
                  if (load) {
                    this.charges = this.home.data.charges.filter(charge => { return charge.room === this.room || charge.room < 1; });
                    this.undo();
                    this.title = `${this.home.data.rooms.filter(room => { return room.id === this.room; })[0].na}の`;
                    this.home.room$.next(this.room);
                    let room$ = this.home.room$.asObservable().pipe(takeUntil(this.onDestroy$), skip(1)).subscribe(room => {
                      console.log(`room$ in charge page fire ${room}`);
                      if (room) {
                        room$.unsubscribe();
                        this.router.navigate([`/post/room`, room]);
                      }
                    })
                  };
                })
              } else if (params.id in CHARGETYP) {
                this.create({ ...this.CHARGE, prop: this.prop, room: this.room, id: "new", typ: params.id, na: "新しい課金", txt: "", ext: "", qty: 9999 }).then(id => {
                  this.router.navigate(['/post/charge', this.prop, this.room, id]);
                });
              }
            }
          } else {
            this.editable = false;
            //this.router.navigate(['login']);
          }
          this.user = user;
        });
        this.chargeTyps=[];
        Object.keys(CHARGETYP).forEach(key => {
          this.chargeTyps.push({ key: key, na: CHARGETYP[key].na });
        })
      }
    });
    this.home.charge$.asObservable().pipe(takeUntil(this.onDestroy$)).subscribe(id => {
      console.log(`charge$ in charge page fire ${id}`);
      if (id && this.id && id !== this.id) {
        this.id = id;
        this.undo();
      }
    })
  }
  undo(method?: number) {
    let charge: Charge;
    let charges: Charge[] = [];
    if (method == null) {
      charges = this.charges.filter(c => { return c.id === this.id; });
    } else {
      charges = this.charges.filter(c => { return c.id === this.id && c.room === method; });
    }
    charge = charges.length ? charges[charges.length - 1] : this.CHARGE;
    this.method = method == null ? charge.room : method;
    this.chargeForm.patchValue(charge);
    this.chargeForm.markAsPristine();
  }
  switch(e) {
    this.undo(Number(e.detail.value));
  }
  async copy() {
    let charges = this.charges.filter(c => { return c.room !== this.method; });
    if (charges.length === 1) {
      this.create({ ...charges[0], room: Number(this.method) }, true);//this.chargeForm.patchValue(charges[0]);
    } else if (charges.length === 2) {
      const alert = await this.alert.create({
        header: '課金をコピー',
        message: `「${this.METHOD[charges[0].room]}」の内容をコピーしますか。<br>「いいえ」で「${this.METHOD[charges[1].room]}」の内容をコピーします。`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'いいえ',
            handler: () => {
              this.create({ ...charges[1], room: Number(this.method) }, true);//this.chargeForm.patchValue(charges[1]);
            }
          }, {
            text: 'はい',
            handler: () => {
              this.create({ ...charges[0], room: Number(this.method) }, true);//this.chargeForm.patchValue(charges[0]);
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.ui.alert("コピー元がありません。");
    }
  }
  imgChange(e) {
    if (e.target.files[0].type.match(/image.*/)) {
      this.imgBlob = window.URL.createObjectURL(e.target.files[0]);
      this.chargeForm.markAsDirty();
    } else {
      this.ui.pop("画像ファイルjpgまたはpngを選択してください。");
    }
  }
  async modalPlan(typ: string) {
    const modal = await this.modal.create({
      component: PlanComponent,
      componentProps: {
        prop: this.prop, id: this.id, method: Number(this.method),
        room: { ...this.chargeForm.value, id: this.room }, cache: this.planCache, typ: typ
      },
    });
    return await modal.present().then(() => {
      modal.onDidDismiss().then(event => {
        if (event.data) this.planCache = event.data;
      });
    });
  }
  async save() {
    if (this.editable) {
      if (this.chargeForm.dirty) {
        this.saving = true;
        this.ui.loading('保存中...');
        let update: any = { ...this.chargeForm.value };
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
          const imagePut = (prop: number, room: number, id: number, typ: string) => {
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
                  const ref = this.storage.ref(`charge/${id}/${room}/${typ}.jpg`);
                  await ref.put(blob);
                  const url = await ref.getDownloadURL().toPromise();
                  return resolve(url);
                }, "image/jpeg")
              }
              image.src = this.imgBlob;
            });
          }
          update.img = await imagePut(this.prop, this.room, this.id, "medium");
          update.simg = await imagePut(this.prop, this.room, this.id, "small");
        }
        let duplicate = [];
        Object.keys(update).forEach(key => {
          if (update[key] === "") { update[key] = null; }
          duplicate.push(key);
        })
        const insert = { ...update, prop: this.prop, room: Number(this.method), id: this.id };
        this.api.post('query', { table: "charge", duplicate: duplicate, insert: insert }).then(async () => {
          let charges = this.charges.filter(charge => { return charge.room === Number(this.method) && charge.id === this.id; });
          if (charges.length) {
            Object.keys(update).forEach(key => {
              charges[0][key] = update[key];
            })
          } else {
            this.charges.push(insert);
          }
          this.saving = false;
        }).catch(() => {
          this.ui.alert(`保存に失敗しました。`);
        }).finally(() => {
          this.chargeForm.markAsPristine();
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
      header: '新しい課金を作成',
      message: '現在の内容を元にして新しい課金を作成しますか。<br>「いいえ」で現在の編集内容を破棄します。',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'いいえ',
          handler: () => {
            this.create({ ...this.CHARGE, prop: this.prop, room: Number(this.method), id: "new", typ: 'people', na: "大人", txt: "", ext: "人", qty: 9999 });
          }
        }, {
          text: 'はい',
          handler: () => {
            this.create({ prop: this.prop, room: Number(this.method), id: "new", ...this.chargeForm.value }, true);
          }
        }
      ]
    });
    await alert.present();
  }
  add() {
    const c = this.charges[0];
    this.create({ ...this.CHARGE, prop: this.prop, room: Number(this.method), id: this.id, typ: c.typ, na: c.na, txt: c.txt, ext: c.ext, qty: 9999 });
  }
  async create(insert, copy?: boolean) {
    return new Promise((resolve, reject) => {
      if (this.editable) {
        this.ui.loading("作成中");
        this.saving = true;
        this.api.post("query", { table: "charge", insert: insert }).then(async res => {
          if (res.charge) {
            if (copy) {
              let calendar = await this.api.get('query', { table: "charge_calendar", select: ["*"], where: { prop: this.prop, room: Number(this.method), id: this.id } });
              if (calendar.charge_calendars.length) {
                let key = insert.id === "new" ? "id" : "room";
                calendar.charge_calendars.map(calendar => {
                  calendar[key] = res.charge[key];
                  return calendar;
                });
                await this.api.post('querys', { table: "charge_calendar", inserts: calendar.charge_calendars });
              }
              if (insert.id === "new") {
                let doc = await this.api.get('query', { table: "story", select: ["*"], where: { typ: "charge", parent: this.id } });
                if (doc.storys.length) {
                  doc.storys.map(story => {
                    story.parent = res.room.id;
                    return story;
                  });
                  await this.api.post('querys', { table: "story", inserts: doc.storys });
                }
              }
            }
            if (insert.id === "new") {
              this.id = res.charge.id;
              this.charges = [res.charge];
              resolve(this.id);
            } else {
              this.charges.unshift(res.charge);
              this.undo();
              this.saving = false;
              resolve(true);
            }
          }
        }).catch(err => {
          this.ui.alert(`新規課金の作成に失敗しました。\r\n${err.message}`);
          reject();
        }).finally(() => {
          this.ui.loadend();
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
      const part = () => {
        const method = Number(this.method);
        this.api.post('querys', { deletes: [{ prop: this.prop, room: method, id: this.id, table: "charge" }, { prop: this.prop, room: method, id: this.id, table: "charge_calendar" }] }, "削除中").then(res => {
          this.charges = this.charges.filter(charge => { return charge.room !== method; });
          this.chargeForm.reset();
          this.ui.pop(`${this.METHOD[method]}課金を削除しました。`);
        }).catch(err => {
          this.ui.alert(`削除できませんでした。\r\n${err.message}`);
        })
      }
      const all = () => {
        this.ui.loading('削除中...');
        this.api.get('query', { table: 'story', select: ['file'], where: { typ: 'charge', parent: this.id } }).then(async res => {
          for (let story of res.storys) {
            if (story.file) this.storage.ref(`charge/${this.id}/${story.file}`).delete();
          }
          await this.api.post('querys', { deletes: [{ parent: this.id, typ: 'charge', table: "story" }, { prop: this.prop, id: this.id, table: "charge_calendar" }, { prop: this.prop, id: this.id, table: "charge" }] });
          await this.db.list(`charge/${this.id}`).remove();
          await this.store.collection('charge').doc(this.id.toString()).delete();
          this.charges.map(async charge => {
            if (charge.img) {
              await this.storage.ref(`charge/${charge.id}/${charge.room}/medium.jpg`).delete();
              await this.storage.ref(`charge/${charge.id}/${charge.room}/small.jpg`).delete();
            }
          })
          this.id = null;
          this.charges = [];
          this.chargeForm.reset();
          this.ui.pop("課金を削除しました。");
        }).catch(err => {
          this.ui.alert(`削除できませんでした。\r\n${err.message}`);
        }).finally(() => { this.ui.loadend(); });
      }
      if (this.charges.length === 1) {
        if (await this.ui.confirm("確認", "削除してよろしいですか。")) {
          all();
        }
      } else {
        const alert = await this.alert.create({
          header: '課金を削除',
          message: `「${this.METHOD[this.method]}」を削除しますか。<br>「いいえ」で「共有」「標準」「個別」全て削除します。`,
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            }, {
              text: 'いいえ',
              handler: () => {
                all();
              }
            }, {
              text: 'はい',
              handler: () => {
                if (this.charges.length === 1) {
                  all();
                } else {
                  part();
                }
              }
            }
          ]
        });
        await alert.present();
      }
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
    this.planY = this.plan.nativeElement.offsetTop;
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