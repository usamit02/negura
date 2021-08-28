export class Unit {
  items: number[];
  na?: string;//ユーザーごとに保存してあるunitパターンの名前（例：個人、サークル、会社）
  constructor(items?: number[], na?: string) {
    this.items = items ? items : [];
    if (na) this.na = na;
  }
  protected toObj(array: number[]) {//[{id:x,...},{id:y,...}...]arrayからidでグループ化したcountを値に持つObject({x:count,y:count,...})を返す
    let obj: any = {};
    for (let key of array) {
      if (obj[key]) {
        obj[key]++;
      } else {
        obj[key] = 1;
      }
    }
    return obj;
  }
  closes(charge): number[] {
    return this.items.filter(item => { return !charge[item] || charge[item].qty == 0; });
  }
  size(charge): number {
    let size = 0;
    for (let item of this.items) {
      size += charge[item] ? charge[item].size : 0;
    }
    return size;
  }
  amount(charge): number {
    let amount = 0;
    for (let item of this.items) {
      amount += charge[item] ? charge[item].price : 0;
    }
    return amount;
  }
  toString(charge): any {
    let strObj = {};
    const obj = this.toObj(this.items);
    Object.keys(obj).forEach(id => {
      const str = `${charge[id].na}:${obj[id] + charge[id].ext} `;
      if (strObj[charge[id].typ]) {
        strObj[charge[id].typ] += str;
      } else {
        strObj[charge[id].typ] = str;
      }
    })
    return strObj;
  }
  toStringAll(charge): string {
    let str = "";
    const strObj = this.toString(charge);
    Object.keys(strObj).forEach(key => {
      str += strObj[key] + "";
    })
    return str;
  }
  typ(typ: string, charge): Object {
    return this.toObj(this.items.filter(item => { return charge[item].typ === typ; }))
  }
  charge() {
    return this.toObj(this.items);
  }
}
