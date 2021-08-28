import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MapComponent } from './map.component';
import { MapDirectionsRenderer } from './map.directions.renderer';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
@NgModule({
  imports: [CommonModule, IonicModule, GoogleMapsModule, HttpClientModule, HttpClientJsonpModule],
  declarations: [MapComponent, MapDirectionsRenderer],
  exports: [MapComponent]
})
export class MapModule { }