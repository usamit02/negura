import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../service/api.service';
import { Room, ROOM ,Charge } from '../../class';
@Injectable({ providedIn: 'root' })
export class HomeService {
  private loaded = false;
  data: Data;
  room$ = new BehaviorSubject<number>(null);
  charge$ = new BehaviorSubject<number>(null); 
  rooms$ = new BehaviorSubject<Room[]>(null);
  load$ = new BehaviorSubject<boolean>(null);
  constructor(private api: ApiService, private loader: LoadingController,) { }
  load(prop: number): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!this.loaded) {
        const loading = await this.loader.create({ message: '計算中です...', duration: 30000 });//this.ui.loading();    
        await loading.present();
        this.api.get('calendar', { prop: prop }).then(res => {
          delete res.msg;
          this.data = res;
          resolve(this.data);
          this.load$.next(true);
        }).catch(err => {
          alert("計算失敗しました。");
          console.error(err.message);
          reject();
        }).finally(() => {
          loading.dismiss();
        })
      } else {
        resolve(this.data);
      }
    })
  }
}
interface Data{
  rooms:Room[];
  charges:Charge[];
  calendars:any[];  
  room_calendars:any[];
  charge_calendars:any[];
}
