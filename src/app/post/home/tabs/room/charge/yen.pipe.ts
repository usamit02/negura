import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'yen'
})
export class YenPipe implements PipeTransform {
  constructor() { }
  transform(amount: number, type: string = "free"): string {    
    switch (type) {
      case 'free':
        if(amount){
          return new Intl.NumberFormat().format(amount) + "円";
        }else{
          return "無料";
        } 
      case 'last':      
      default: throw new Error(`Invalid safe type specified: ${type}`);
    }
  }

}