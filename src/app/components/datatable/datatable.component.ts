import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import GLightbox from 'glightbox';

import {DatatableModel} from './datatable.model';

@Component({
  selector: 'app-geneat-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() columns: DatatableModel[];
  @Input() loading: boolean;
  @Input() lightBox = false;
  @Input() large = false;
  @Input() save = true;
  @Input() showPagination = true;
  @Input() showSearch = true;
  @Input() showCheckbox = false;
  @Input() showCount = true;
  @Input() showHeader = true;
  @Input() checkboxCondition;
  @Input() checkboxValue = 'id';

  @Input() showRadio = false;
  @Input() labelRadio = 'Radio';
  @Input() radioKey = 'id';

  @Input() data = [];
  @Input() total = 0;
  @Input() pageSize = 30;
  @Output() ngChange = new EventEmitter();
  @Input() leftHeader: HTMLTemplateElement;
  @Input() rightHeader: HTMLTemplateElement;
  @Input() renderGrid: HTMLTemplateElement;
  @Input() filterGrid: HTMLTemplateElement;
  @Input() pageSizeOptions = [10, 20, 30, 40];
  @Input() display = 1;
  @Input() width = 'inherit';
  @Input() rowHeight = '37px';
  @Input() boxShadow = false;
  @Input() showLayout = true;
  @Input() alignBetween = false;
  @Input() renderGridTwoColumnMobile = true;
  langPrefix = 'components.Datatable';

  checked = false;
  indeterminate = false;
  setOfChecked = new Set();
  dataChecked = [];
  radioValue = '';

  paramTable = {
    pageIndex: 1,
    pageSize: this.pageSize,
    filter: {
      fullTextSearch: ''
    },
    sort: {},
  };
  filterValue = null;
  search: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    if (this.save) {
      this.route.queryParams.subscribe(queryParams => {
        this.paramTable = {
          pageIndex: queryParams.pageIndex ? parseInt(queryParams.pageIndex, 0) : 1,
          pageSize: queryParams.pageSize ? parseInt(queryParams.pageSize, 0 ) : this.pageSize,
          filter: queryParams.filter ? JSON.parse(queryParams.filter) : {},
          sort: queryParams.sort ? JSON.parse(queryParams.sort) : {},
        };
        setTimeout(() => {
          if (this.paramTable.filter.fullTextSearch) {
            this.search = this.paramTable.filter.fullTextSearch;
          }
          this.changeData();
        });
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data && changes.data.currentValue) {
      if (this.lightBox) {
        setTimeout(() => GLightbox(), 1000);
      }
      if (changes.data.currentValue.length) {
        this.refreshCheckedStatus();
      }
    }
  }

  pickTextColorBasedOnBgColorAdvanced = (bgColor, lightColor, darkColor) => {
    if (bgColor === 'transparent') {
      return null;
    }
    const color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.4) ? darkColor : lightColor;
  }

  checkActive(column): boolean {
    if (this.paramTable.filter[column.name]) {
      column.tableItem.filter.value = this.paramTable.filter[column.name];
      return true;
    }
    return false;
  }
  changeData(): void {
    const paramRequest = {
      page: 1,
      size: this.pageSize,
      filter: '',
      sort: [],
    };
    paramRequest.page = this.paramTable.pageIndex;
    paramRequest.size = this.paramTable.pageSize;
    paramRequest.filter = JSON.stringify(this.paramTable.filter);
    for (const key in this.paramTable.sort) {
      if (this.paramTable.sort.hasOwnProperty(key)) {
        paramRequest.sort.push((this.paramTable.sort[key] === 'ascend' ? '+' : '-') + key);
      }
    }
    if (paramRequest.sort.length === 0) {
      delete paramRequest.sort;
    }
    this.ngChange.emit(paramRequest);
  }
  sort(data, name): void {
    if (data) {
      this.paramTable.sort[name] = data ? data : null;
    } else {
      delete this.paramTable.sort[name];
    }
    this.updateQueryParams();
  }
  filter = (data, index, value) => {
    this.paramTable.filter[data] = value;
    this.paramTable.pageIndex = 1;
    if (index != null) {
      this.columns[index].tableItem.filter.visible = false;
      this.filterValue = null;
    }
    this.updateQueryParams();
  }
  searchFull(): void {
    if (this.search) {
      this.paramTable.filter.fullTextSearch = this.search;
    } else {
      delete this.paramTable.filter.fullTextSearch;
    }
    this.paramTable.pageIndex = 1;
    this.updateQueryParams();
  }
  resetFilter(index, name): void {
    if (index) {
      this.columns[index].tableItem.filter.value = null;
      this.columns[index].tableItem.filter.visible = false;
    }
    delete this.paramTable.filter[name];
    this.filterValue = null;
    this.updateQueryParams();

  }
  checkFilter(visible, index): void {
    if (!visible) {
      const defaultValue = this.paramTable.filter[this.columns[index].name];
      this.columns[index].tableItem.filter.value = defaultValue ? defaultValue : null;
      this.filterValue = null;
    } else {
      this.filterValue = this.columns[index].tableItem.filter.value;
    }
  }
  logFilter(value): void {
    this.filterValue = value;
  }
  updateQueryParams(): void {
    const param = JSON.parse(JSON.stringify(this.paramTable));
    param.filter = JSON.stringify(this.paramTable.filter);
    param.sort = JSON.stringify(this.paramTable.sort);
    if (this.save) {
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: param,
          queryParamsHandling: 'merge',
        });
    } else {
      this.changeData();
    }
  }
  nzQueryParams(data): void {
    if (this.paramTable.pageSize !== data.pageSize || this.paramTable.pageIndex !== data.pageIndex) {
      this.paramTable.pageSize = data.pageSize;
      this.paramTable.pageIndex = data.pageIndex;
      this.updateQueryParams();
    }
  }

  onAllChecked = (checked: boolean) => {
    if (checked) {
      this.data
        .filter((item) => !!this.checkboxCondition ? !this.checkboxCondition(item) : !this.setOfChecked.has(item[this.checkboxValue]))
        .forEach((item) => this.updateCheckedSet(item, checked));
    } else {
      this.dataChecked = [];
      this.setOfChecked = new Set();
    }
    this.refreshCheckedStatus();
  }
  updateCheckedSet(item, checked: boolean): void {
    if (checked) {
      this.setOfChecked.add(item[this.checkboxValue]);
      this.dataChecked.push(item);
    } else {
      this.setOfChecked.delete(item[this.checkboxValue]);
      this.dataChecked = this.dataChecked.filter((data) => item[this.checkboxValue] !== data[this.checkboxValue]);
    }
  }
  refreshCheckedStatus(): void {
    const listOfEnabledData = this.data.filter((item) => !!this.checkboxCondition ? !this.checkboxCondition(item) : true);
    this.checked = listOfEnabledData.every((item) => this.setOfChecked.has(item[this.checkboxValue]));
    this.indeterminate = listOfEnabledData.some((item) => this.setOfChecked.has(item[this.checkboxValue])) && !this.checked;
  }
  onItemChecked(item, checked: boolean): void {
    this.updateCheckedSet(item, checked);
    this.refreshCheckedStatus();
  }
  handleChangeDisplay(display: number): void {
    this.display = display;
    if (this.lightBox) {
      setTimeout(() => GLightbox(), 1000);
    }
  }
  handleChangeRadio(value): void {
    this.radioValue = value;
  }
}
