import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User, Column } from '../../../../class';
import { ApiService } from './../../../../service/api.service';
import { StateService } from './../../../../service/state.service';
@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent implements OnInit, OnDestroy {
  @Input() user: User;
  @Output() close = new EventEmitter();
  mode: string;
  columns = [];
  column = { parent: 0, grand: null, lock: 0, up: null };
  allColumns: Array<Column> = [];
  private onDestroy$ = new Subject();
  constructor(private router: Router, private state: StateService, private api: ApiService,) { }
  ngOnInit() {
    this.openColumn(true);
  }
  openColumn(init?: boolean) {
    if (this.allColumns.length) {
      this.loadColumns(this.column.parent, init);
    } else {
      this.api.get('column', { uid: this.user.id }).then(res => {
        this.allColumns = res.columns;
        this.state.update(state => ({ ...state, columns: res.columns }));
        this.loadColumns(0, init);
      }).catch(() => {
        alert(`コラムの読込に失敗しました。`);
      });
    }
  }
  loadColumns(parent, init?: boolean) {
    this.column.parent = parent;
    const parentColumn = this.allColumns.filter(column => { return column.id === parent; });
    if (parentColumn.length) {
      this.column.grand = parentColumn[0].parent;
      this.column.up = parentColumn[0].na;
      this.column.lock = this.user.admin || parentColumn[0].user === this.user.id ? 0 : parentColumn[0].lock;
    } else {
      this.column.grand = 0;
      this.column.up = null;
      this.column.lock = 0;
    }
    this.columns = this.allColumns.filter(column => { return column.parent === parent; });
    this.columns.sort((a, b) => {
      if (a.idx < b.idx) return -1;
      if (a.idx > b.idx) return 1;
      return 0;
    });
    if (!init) this.router.navigate(['/columns', parent]);
  }
  reorderColumns(e) {
    let temp = this.columns[e.detail.from];
    this.columns[e.detail.from] = this.columns[e.detail.to];
    this.columns[e.detail.to] = temp;
    this.api.post('column', { ids: JSON.stringify(this.columns.map(column => { return column.id; })) });
    e.detail.complete(true);
  }
  link(url, modeKeep?: boolean) {
    this.router.navigate([`/${url}`]);
    if (!modeKeep) this.mode = "";
    this.close.emit();
  }
  menuClose() {
    this.close.emit();
  }
  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
