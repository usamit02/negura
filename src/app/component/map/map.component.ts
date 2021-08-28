import { Component, OnChanges, OnInit, Input, ViewChild, NgZone, SimpleChanges, OnDestroy } from '@angular/core';
import { MapInfoWindow, MapMarker, } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Marker } from '../../post/component/marker/marker.component';
import { APIURL } from '../../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() typ: string;
  @Input() parent: number;
  @Input() markers: Array<Marker>;
  @Input() travelMode: string;
  //@Output() saved = new EventEmitter();
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  apiLoaded: Observable<boolean>;
  center: google.maps.LatLngLiteral;
  directionsResults$: Observable<google.maps.DirectionsResult | undefined>;
  mark = { id: 0, na: "", txt: "", img: "" };
  marker: Marker;
  options:google.maps.DirectionsRendererOptions;
  directionsService: google.maps.DirectionsService;
  private onDestroy$ = new Subject();
  constructor(private http: HttpClient, private readonly _ngZone: NgZone) {
    this.center = { lat: 34.68503331, lng: 138.85154339 };
    this.options={suppressMarkers:true}
  }
  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (typeof (google) === 'object' && typeof (google.maps) === 'object') {
      this.apiLoaded = of(true);
      this.init(changes);
    } else {
      this.apiLoaded = this.http.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyB4D969VIv64a6rMFtrtX2wpHUhuosD9h0', 'callback')
        .pipe(map(() => {
          this.init(changes);
          return true;
        }), catchError(() => of(false)));
    }
  }
  init(changes: SimpleChanges) {
    this.directionsService = new google.maps.DirectionsService();
    if (changes.parent) {
      this.get('query', { select: ['id', 'latlng', 'na', 'txt', 'img', 'icon', 'idx'], table: 'story_marker', where: { typ: this.typ, parent: this.parent } }).then(res => {
        this.undo(res.story_markers);
      });
    } else if (changes.markers) {     
        this.undo(this.markers);
    }
  }
  undo(markers: Marker[]) {
    let i = 1;
    this.markers = markers.map(marker => {
      marker.option = { position: { lat: marker.lat, lng: marker.lng } };
      i++;
      return marker;
    });;
    if (markers.length) {
      this.center = { lat: markers[0].lat, lng: markers[0].lng };
      if (markers.length > 1 && markers.length < 26) {
        const points = this.markers.map(marker => { return { lat: marker.lat, lng: marker.lng } });
        let waypoints = points.slice(1, points.length - 1).map(waypoint => {
          let location = new google.maps.LatLng({ lat: waypoint.lat, lng: waypoint.lng });
          return { location: location, stopover: false };
        });
        const request: google.maps.DirectionsRequest = {
          destination: points[points.length - 1], waypoints: waypoints,
          origin: points[0],
          travelMode:google.maps.TravelMode[this.travelMode]
        };
        this.directionsResults$ = this.route(request).pipe(map(response => response.result));
      } else {
        this.directionsResults$ = undefined;
      }
    } else {
      this.directionsResults$ = undefined;
    }
  }
  route(request: google.maps.DirectionsRequest): Observable<MapDirectionsResponse> {
    return new Observable(observer => {
      const callback =
        (
          result: google.maps.DirectionsResult | undefined,
          status: google.maps.DirectionsStatus
        ) => {
          this._ngZone.run(() => {
            observer.next({ result, status });
            observer.complete();
          });
        };
      this.directionsService.route(request, callback);
    });
  }
  openInfoWindow(mapMarker: MapMarker, marker: Marker) {
    this.mark = { id: marker.id, na: marker.na, txt: marker.txt, img: marker.img };
    this.infoWindow.open(mapMarker);
    this.marker = marker;
  }
  get(url: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
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
      });
    });
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
interface MapDirectionsResponse {
  status: google.maps.DirectionsStatus;
  result?: google.maps.DirectionsResult;
}