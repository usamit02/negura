import { Injectable } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class ScrollEndService {
  private _state$ = new BehaviorSubject<EndState>(ini);
  set(content: IonContent, onDestroy$: Subject<any>) {
    const onScrollend = async () => {    
      const el = await content.getScrollElement();      
      this._state$.next({ y: el.scrollTop, h: el.offsetHeight, H: el.scrollHeight })
      //console.log('scroll end service y:', el.scrollTop, ' h:', el.offsetHeight, ' H:', el.scrollHeight);
    }
    setTimeout(() => { onScrollend(); }, 2000)
    content.ionScrollEnd.pipe(takeUntil(onDestroy$)).subscribe(() => { onScrollend(); })
  }
  get $(): Observable<EndState> {
    return this._state$.asObservable();
  }
  get(na: string) {
    return this._state$.value[na];
  }

}
export interface EndState {
  y: number;
  h: number;
  H: number;
}
const ini = {
  y: null,
  h: null,
  H: null,
}