import { Component } from '@angular/core';

@Component({
  selector: 'ion-calendar-week',
  styleUrls: ['./calendar-week.component.scss'],
  template: `
    <ion-toolbar [class]="'week-toolbar'" no-border-top>
      <ul [class]="'week-title'">
       <li style='color:red'>日</li><li>月</li><li>火</li><li>水</li><li>木</li><li>金</li><li style="color:blue">土</li>        
      </ul>
    </ion-toolbar>
  `,
})
export class CalendarWeekComponent {
 
  constructor() {}

  
}
