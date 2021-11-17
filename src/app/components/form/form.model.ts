import {FormControl} from '@angular/forms';
import {TableItem} from '@components/datatable/datatable.model';

export class FormModel {
  name?: string;
  title?: string;
  formItem?: FormItem;
  tableItem?: TableItem;

  constructor() {
  }
}

export class FormItem {
  type?: string;
  title?: any;
  value?: any;
  formatDate?: string;
  confirm?: boolean;
  html?: string;
  mask?: string;
  maskPrefix?: string;
  number?: boolean;
  autoSet?: any;
  onSearch?: any;
  edit?: boolean;
  readonly?: boolean;
  show?: boolean;
  rules?: FormItemRule[];
  list?: FormItemList[];
  listAutocomplete?: FormItemList[];
  addOnBefore?: any;
  addOnAfter?: any;
  placeholder?: string;
  col?: number;
  condition?: any;
  render?: any;
  customSelectContent?: any;
  constructor() {
  }

}
export class FormItemList {
  label: string;
  value: any;
  danger?: boolean;

  constructor() {
  }
}

export class FormItemRule {
  type: string;
  message?: string;
  value?: any;
  validator?(control: FormControl): void;

  constructor() {
  }
}
