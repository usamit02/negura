import { Component, OnInit, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Request } from 'express';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { PROPS } from './config';
import { Prop } from './class';
import { StateService } from './service/state.service';
import { UserService } from './service/user.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(@Optional() @Inject(REQUEST) protected request: Request, @Inject(PLATFORM_ID) private platformId: Object,
    private state: StateService, private user: UserService,) {
    let host: string;
    let isServer = isPlatformServer(this.platformId);
    if (isServer) {
      host = this.request.headers['x-forwarded-host'].toString();//console.log(`xforwardedhost:${this.request.headers['x-forwarded-host']}`); 
    } else {
      host = document.location.hostname;//console.log('document: ', document.location.hostname);
    }
    let props: Prop[] = PROPS.filter(prop => { return prop.host === host });
    if (props.length) {
      this.state.update(state => ({ ...state, prop: props[0], isServer: isServer })); console.log(`state update prop:${props[0].id} host:${host} isServer:${isServer}`);
    }
  }
  ngOnInit() {
    this.user.login();
  }
}
