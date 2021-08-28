import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { APIURL } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private loadingController: LoadingController,) { }
  get(url: string, params: any, msg?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let loader;
      if (msg) {
        loader = await this.loadingController.create({ message: msg, duration: 30000 });
        await loader.present();
      }
      if (url.indexOf('query') !== -1) params = { param: JSON.stringify(params) };
      this.http.get(APIURL + url + ".php", { params: params }).toPromise().then((res: any) => {
        if (res.msg === "ok") {
          resolve(res);
        } else {
          alert(`${res.msg}\r\n${res.err}`);
          console.error(`PDO errorInfo:${res.err}`)
          reject();
        }
      }).catch(error => {
        alert("通信エラー  \r\n" + error.message);
        reject();
      }).finally(() => {
        if (loader) { loader.dismiss(); }
      });
    });
  }
  post(url: string, params: any, msg?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let loader;
      if (msg) {
        loader = await this.loadingController.create({ message: msg, duration: 30000 });
        await loader.present();
      }
      if (url.indexOf('query') !== -1) {
        params = { param: JSON.stringify(params) };
      } else if (url.indexOf('beds24') !== -1) {
        params.param = JSON.stringify(params.param);
      }
      let body = new HttpParams;
      for (const key of Object.keys(params)) {
        body = body.append(key, params[key]);
      }
      this.http.post(APIURL + url + ".php", body).toPromise().then((res: any) => {
        if (res.msg === "ok") {
          resolve(res);
        } else {
          alert(res.msg);
          reject();
        }
      }).catch(error => {
        alert("通信エラー  \r\n" + error.message);
        reject();
      }).finally(() => {
        if (loader) { loader.dismiss(); }
      });
    });
  }
  upload(url: string, formData: any): Observable<Object> {
    let fd = new FormData;
    for (const key of Object.keys(formData)) {
      fd.append(key, formData[key]);
    }
    let params = new HttpParams();
    const req = new HttpRequest('POST', APIURL + url + ".php", fd, { params: params, reportProgress: true });
    return this.http.request(req);//return this.http.post(this.url + url, fd, { reportProgress: true,observe:'events' });    
  }
  getAPI(url: string, params: any, msg?: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let loader;
      if (msg) {
        loader = await this.loadingController.create({ message: msg, duration: 30000 });
        await loader.present();
      }
      this.http.get(url, { params: params }).toPromise().then((res: any) => {
        resolve(res);
      }).catch(error => {
        alert("通信エラー  \r\n" + error.message);
        reject();
      }).finally(() => {
        if (loader) { loader.dismiss(); }
      });
    });
  }
}
