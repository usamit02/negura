import { Observable } from "rxjs";

export interface User {
  id: string;
  na: string;
  displayName: string;
  photoURL: string;
  avatar: string;
  image: string;
  token: string;
  admin: number;
  direct: string;
  cursor?: Date;
  p?: number;
  plan?: string;
  trial?: string;
  bank?: string;
}
export const USER = { id: "", na: "ゲスト", displayName: "", photoURL: "", avatar: "https://bloggersguild.cf/img/avatar.jpg", image: "https://bloggersguild.cf/img/avatar.jpg", token: "", admin: 0, direct: 'block' };

export interface Column {
  parent: number;
  id: number;
  na: string;
  kana: string;
  img: string;
  txt: string;
  user?: string;
  ack?: number;
  acked?: Date;
  ackuser?: string;
  created?: Date;
  idx?: number;
  lock?: number;
  rest?: boolean;
  chat?: boolean;
  detail$?: Observable<any>;
}
export const COLUMN = { parent: 0, id: 0, na: "新しいコラムを追加", kana: "", img: "", txt: "" };

export interface Marker {
  lat: number;
  lng: number;
  len?: number;
  label?: string;
  id: number;
  na: string;
  kana?: string;
  txt: string;
  img: string;
  simg?: string;
  url?: string;
  phone?: string;
  icon: string | number;
  iconurl?: string;
  user?: string;
  user$?: Object;
  author?: any;
  created?: Date | string;
  ack?: number;
  ackuser?: string;
  acked?: Date | string;
  rest?: number;
  chat?: number;
  distance?: string;
  //option?: google.maps.MarkerOptions;
}
export const MARKER = { id: 0, na: "", kana: "", txt: "", lat: 34.68503331, lng: 138.85154339, url: "", phone: "", user: null, user$: {}, img: "", simg: "", icon: 0 };

export interface Prop {
  //----------const
  id: number;
  na: string;
  roomTyps: number[];//洋室、和室、キャンプ、バンガロー等const ROOMTYPのid
  host: string;//ドメインnegura.gq
  lat: number;//googleMap
  lng: number;//googleMap
  zoom: number;//googleMap
  marker: number;//googleMap
  icon: string;
  users: string[];//編集権限のあるuserId
  txts: string[];//トップページのスライダーに表示
  //-----------MySQL
  cancels?: any[];
  price: number;//入場料  
  charges: Charge[];//駐車料等他の料金
  unitInis: string[];//chargeの初期値
  term: string;//予約受付期間
  close: boolean;//休止
  idx: number;//並び順
}
export const PROP = {
  id: 0, na: '', roomTyps: [], host: 'localhost', lat: 34.68503331, lng: 138.85154339, zoom: 12, marker: 1, icon: "",
  users: ['rbcAU6MV38dArpipevYFLoV4YvK2'], txts: [],
  cancels: [{ 0: 90 }, { 1: 70 }, { 3: 50 }, { 7: 20 }, { 14: 10 }], price: 0, charges: [], unitInis: ["person"], term: "", close: true, idx: 0
}
export interface Room {
  id: number;
  prop: number;//建物、施設id
  typ: number;//ROOMTYP　和室、洋室、キャンプ、バンガローなど
  na: string;
  title?: string;
  txt: string;//説明文
  img: string;
  simg: string;
  limg: string;
  price: number;//標準価格
  qty: number;//在庫
  size: number;//フリーサイト面積上限
  created: Date;
  chat: boolean;//true=チャット口コミ書込み可
  aday: number; //日帰り料金
  close: boolean;//true=休止中
  idx: number;//並び順
  beds24: boolean;//true=OTA連携
  beds24id: number;//beds24のroomId
  max_people?: number;
  max_adult?: number;
  max_child?: number;
  min_stay?: number;
  max_stay?: number;
  min_price?: number;
  day?;
  charge?;
  amount?: number;
  status?: string;
  msg?: string;
  pop?: string;
}
export const ROOM = { id: 0, prop: 0, typ: 0, na: "", txt: "", img: "", simg: "", limg: "", price: 0, qty: 0, size: 0, created: null, chat: false, aday: null, close: null, idx: 0, beds24: false, beds24id: 0, charge: {} }

export interface RoomTyp {
  id: number;
  na: string;
  rooms: Array<Room>;
  icon?: string;
  hide?:boolean;
}

export interface Charge {
  prop?: number;
  room?: number;
  id?: number;
  na?: string; 
  typ: string;//people,vehicle,tent...etc
  img?:string;
  simg?:string;
  limg?:string;
  icon?:string;
  txt?:string;
  ext?:string;  
  min: number;
  max: number;
  price: number;
  qty:number;
  size: number;
  close?: boolean;
  idx?: number;//並び順
}
export const CHARGETYP = {
  people: { na: "人", control: "input" },
  vehicle: { na: "車両", control: "segment" },
  animal: { na: "ペット", control: "segment" },
  rental: { na: "ﾚﾝﾀﾙ用品", control: "segment" },
  equip: { na: "設備", control: "segment" },
}