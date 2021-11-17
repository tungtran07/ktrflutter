import {FormItem} from '@components/form/form.model';

export class DatatableModel {
  name?: string;
  title?: string;
  formItem?: FormItem;
  tableItem?: TableItem;

  constructor() {
  }
}

export class TableItem {
  width?: string;
  align?: string;
  sort?: string;
  onClick?: any;
  bgColor?: any;
  render?: any;
  show?: {
    type: string,
    left?: any,
    right?: any,
  };
  filter?: TableItemFilter;
  actions?: TableItemActions[];

  constructor() {
  }
}

export class TableItemFilter {
  type: string;
  value: string;
  visible: boolean;
  list?: TableItemFilterList[];

  constructor() {
  }
}

export class TableItemFilterList {
  label: string;
  value: string;

  constructor() {
  }
}

export class TableItemActions {
  text?: any;
  icon?: any;
  onClick?: any;
  condition?: any;
  disabled?: any;
  confirm?: boolean;
  badge?: string;
  bgColor?: any;
  templateDropdown?: any;

  constructor() {
  }
}
