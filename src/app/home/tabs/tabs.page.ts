import { Component } from '@angular/core';
import { StateService } from '../../service/state.service';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  prop;
  constructor(private state:StateService) {}
  ngOnInit() {
    this.state.select(state => state.prop).subscribe((prop) => {
      this.prop = prop;
    })
  }
}

