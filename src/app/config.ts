export const ROOMTYPS = [
  { id: 1, na: '洋室' },
  { id: 2, na: '和室' },
  { id: 3, na: 'ドミトリー' },
  { id: 4, na: 'バンガロー' },
  { id: 5, na: 'キャンプ' }
]
export const VEHICLETYP = {
  0: { na: "", key: "", icon: "", size: 0 },
  1: { na: '車', key: "car", icon: "http://maps.google.co.jp/mapfiles/ms/icons/cabs.png", size: 10 },
  2: { na: 'バイク', key: "motorcycle", icon: "http://maps.google.co.jp/mapfiles/ms/icons/motorcycling.png", size: 5 },
  3: { na: '自転車', key: "bicycle", icon: "http://maps.google.co.jp/mapfiles/ms/icons/cycling.png", size: 3 },
  4: { na: 'トレーラー', key: "trailer", icon: "http://maps.google.co.jp/mapfiles/ms/icons/truck.png", size: 15 }
}
export const PROPS = [
  {
    id: 1, na: '南伊豆ライダーハウスlocal', host: 'localhost', roomTyps: [5, 4], lat: 34.68503331, lng: 138.85154339, zoom: 12, marker: 1,
    icon: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png",
    users: ['Gx3WJkFZUNOkTjwzwp8wSLSdm7G2', 'dqM4Fo1rtXV7Hrs4JYsXgs68Bq93'],
    txts: ['山と川に囲まれた農村の片隅', '管理棟', '炊事場（予定地）', '１０ほどのサイト', '敷地面積2000㎡'],
    cancels: [{ 0: 90 }, { 1: 70 }, { 3: 50 }, { 7: 20 }, { 14: 10 }], term: '2m', price: 0, charges: [], unitInis: ["adult", "motorcycle"], close: false, idx: 1
  },
  {
    id: 2, na: 'ｂｂロード', host: 'stayiot.web.app', roomTyps: [1, 3], lat: 34.7660779797, lng: 138.93926235, zoom: 11, marker: 19, icon: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png",
    users: ['bbloadowner'],
    txts: ['宿は山に囲まれ目の前には美しい渓流が流れています', '広いテラスではファミリーＢＢＱが楽しめます', '西伊豆は絶景の宝庫！ドライブルートには事欠きません。もちろんお勧めコースのご案内も致します', '客室', 'ロビー'],
    cancels: [{ 0: 100 }], term: "30d", price: 0, charges: [], unitInis: ["adult", "motorcycle"], close: false, idx: 1
  },
  {
    id: 3, na: '南伊豆ライダーハウス', host: 'stayiot.cf', roomTyps: [2, 3, 4], lat: 34.68503331, lng: 138.85154339, zoom: 12, marker: 1,
    icon: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png",
    users: ['Gx3WJkFZUNOkTjwzwp8wSLSdm7G2', 'dqM4Fo1rtXV7Hrs4JYsXgs68Bq93'],
    txts: ['山と川に囲まれた農村の片隅', '管理棟', '炊事場（予定地）', '１０ほどのサイト', '敷地面積2000㎡'],
    cancels: [{ 0: 90 }, { 1: 70 }, { 3: 50 }, { 7: 20 }, { 14: 10 }], term: "2m", price: 0, charges: [], unitInis: [], close: false, idx: 1
  },
  {
    id: 4, na: 'negura CAMPGROUND', host: 'negura.gq', roomTyps: [5, 4], lat: 34.68503331, lng: 138.85154339, zoom: 12, marker: 1,
    icon: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png",
    users: ['Gx3WJkFZUNOkTjwzwp8wSLSdm7G2', 'dqM4Fo1rtXV7Hrs4JYsXgs68Bq93'],
    txts: ['ねぐら【塒】•• 動物の眠る場所。巣'],
    cancels: [{ 0: 90 }, { 1: 70 }, { 3: 50 }, { 7: 20 }, { 14: 10 }], term: "3m", price: 0, charges: [], unitInis: ["adult", "adult", "car"], close: false, idx: 1
  },
  {
    id: 5, na: '南伊豆ライダーハウス', host: 'clife.tk', roomTyps: [2, 4], lat: 34.68503331, lng: 138.85154339, zoom: 12, marker: 1,
    icon: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png",
    users: ['Gx3WJkFZUNOkTjwzwp8wSLSdm7G2', 'dqM4Fo1rtXV7Hrs4JYsXgs68Bq93'],
    txts: ['山と川に囲まれた農村の片隅', '管理棟', '炊事場（予定地）', '１０ほどのサイト', '敷地面積2000㎡'],
    cancels: [{ 0: 90 }, { 1: 70 }, { 3: 50 }, { 7: 20 }, { 14: 10 }], term: "50d", price: 0, charges: [], unitInis: ["adult", "motorcycle"], close: false, idx: 1
  },
]
export const HOLIDAYS = ['2021-8-9', '2021-9-20', '2021-9-23', '2021-11-3', '2021-11-23','2022-1-1','2022-1-10','2022-2-11','2022-2-23','2022-3-21','2022-4-29','2022-5-3','2022-5-4','2022-5-5','2022-7-18','2022-8-11','2022-9-19','2022-9-23','2022-10-10','2022-11-3','2022-11-23']

export const MARKERICON = {
  1: { na: '地点', url: "http://maps.google.co.jp/mapfiles/ms/icons/red-dot.png" },
  2: { na: 'スーパー', url: "http://maps.google.co.jp/mapfiles/ms/icons/convienancestore.png" },
  3: { na: '日帰入浴', url: "http://maps.google.co.jp/mapfiles/ms/icons/hotsprings.png" },
  4: { na: 'キャンプ場', url: "http://maps.google.co.jp/mapfiles/ms/icons/campground.png" },
  5: { na: '喫茶店', url: "http://maps.google.co.jp/mapfiles/ms/icons/coffeehouse.png" },
  6: { na: 'レストラン', url: "http://maps.google.co.jp/mapfiles/ms/icons/restaurant.png" },
  7: { na: 'ファストフード', url: "http://maps.google.co.jp/mapfiles/ms/icons/snack_bar.png" },
  8: { na: 'コンビニ', url: "http://maps.google.co.jp/mapfiles/ms/icons/homegardenbusiness.png" },
  9: { na: 'トイレ', url: "http://maps.google.co.jp/mapfiles/ms/icons/toilets.png" },
  10: { na: '駐車場', url: "http://maps.google.co.jp/mapfiles/ms/icons/parkinglot.png" },
  11: { na: '港', url: "http://maps.google.co.jp/mapfiles/ms/icons/marina.png" },
  12: { na: '海水浴場', url: "http://maps.google.co.jp/mapfiles/ms/icons/swimming.png" },
  13: { na: '展望', url: "http://maps.google.co.jp/mapfiles/ms/icons/movies.png" },
  99: { na: 'ホーム', url: "http://maps.google.co.jp/mapfiles/ms/icons/rangerstation.png" },
}