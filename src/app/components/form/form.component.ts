import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {FormModel} from './form.model';

@Component({
  selector: 'app-geneat-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormComponent implements OnInit, OnChanges {
  @Input() columns: FormModel[];
  @Input() textSubmit;
  @Input() noLabel = false;
  @Input() loading: boolean;
  @Input() values: any;
  @Input() widthLabel = 120;
  @Input() col = 1;
  @Input() small = false;
  @Output() handSubmit = new EventEmitter<FormGroup>();

  validateForm: FormGroup;
  $columns: [FormModel[]];
  $cols = [];
  isLoading = false;
  langPrefix = 'components.Form';

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    const configForm = {};
    this.$cols = [...Array(this.col).keys()];
    if (this.values && this.values.id) {
      localStorage.setItem('id_form', this.values.id);
    } else {
      localStorage.setItem('id_form', '0');
    }
    this.columns.map(item => {
        if (item.formItem && item.formItem.edit && (!this.values || this.values && !this.values[item.name])) {
          return item;
        }
        if (!!item.formItem && item.formItem.type === 'autocomplete') {
          item.formItem.listAutocomplete = item.formItem.list;
        }
        if (!!item.formItem && item.formItem.type === 'title') {
          if (!this.$columns) {
            this.$columns = [[item]];
          } else {
            this.$columns.push([item]);
          }
        }
        if (!!item.formItem && item.formItem.type !== 'title') {
          if (item.formItem.type !== 'line') {
            const validators = [];
            if (!!item.formItem.rules && item.formItem.rules.length > 0) {
              item.formItem.rules = item.formItem.rules.map(rule => {
                switch (rule.type) {
                  case 'required':
                    validators.push(Validators.required);
                    if (!rule.message) {
                      rule.message = this.langPrefix + '.rulesRequired';
                    }
                    break;
                  case 'email':
                    validators.push(Validators.email);
                    if (!rule.message) {
                      rule.message = this.langPrefix + '.rulesEmail';
                    }
                    break;
                  case 'maxlength':
                    validators.push(Validators.maxLength(rule.value));
                    if (!rule.message) {
                      rule.message = this.langPrefix + '.rulesMaxlength';
                    }
                    break;
                  case 'minlength':
                    validators.push(Validators.minLength(rule.value));
                    if (!rule.message) {
                      rule.message = this.langPrefix + '.rulesMinlength';
                    }
                    break;
                  case 'min':
                    validators.push(Validators.min(rule.value));
                    if (!rule.message) {
                      rule.message = this.langPrefix + '.rulesMin';
                    }
                    break;
                  case 'custom':
                    validators.push(rule.validator);
                    break;
                }
                return rule;
              });
            }
            if (!this.values) {
              if (item.formItem.type === 'checkbox') {
                configForm[item.name] = [false, Validators.compose(validators)];
              } else {
                configForm[item.name] = [
                  {value: item.formItem.value, disabled: !(item.formItem.show === undefined || !!item.formItem.show)},
                  Validators.compose(validators)
                ];
              }
            } else {
              if (item.formItem.condition) {
                item.formItem.show = item.formItem.condition(this.values);
              }
              configForm[item.name] = [{
                value: this.values[item.name],
                disabled: !(item.formItem.show === undefined || !!item.formItem.show)
              }, Validators.compose(validators)];
            }
          }

          if (this.$columns && this.$columns.length
              && !!this.$columns[this.$columns.length - 1][0]
              && this.$columns[this.$columns.length - 1][0].formItem.type === 'title') {
            this.$columns.push([item]);
          } else {
            if (this.$columns && this.$columns.length) {
              this.$columns[this.$columns.length - 1].push(item);
            } else {
              if (!this.$columns) {
                this.$columns = [[item]];
              } else {
                this.$columns.push([item]);
              }
            }
          }
          if (item.formItem.type === 'password' && !!item.formItem.confirm) {
            configForm['confirm' + item.name] = [
              '', Validators.compose([Validators.required, (control: FormControl): { [s: string]: boolean } => {
                if (!control.value) {
                  return {required: true};
                } else if (control.value !== this.validateForm.controls[item.name].value) {
                  return {confirm: true, error: true};
                }
                return {};
              }])];
            const confirmItem: FormModel = {
              name: 'confirm' + item.name,
              title: item.title + 'Confirm',
              formItem: {
                type: 'password',
                rules: [
                  { type: 'required', message: this.langPrefix + '.rulesRequired' },
                  { type: 'confirm', message: this.langPrefix + '.rulesConfirmPassword' }
                ]
              }
            };
            this.$columns[this.$columns.length - 1].push(confirmItem);
          }
        }
        return item;
      });
    this.validateForm = this.fb.group(configForm);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.values && !!this.validateForm) {
      this.validateForm.setValue(this.values);
    }
  }

  // View HTML
  checkRequired(column: FormModel): boolean {
    return !!column.formItem.rules && column.formItem.rules.filter(item => item.type === 'required').length > 0;
  }

  updateConfirmValidator(name: string): void {
    if (!!this.validateForm.controls['confirm' + name]) {
      Promise.resolve().then(() => this.validateForm.controls['confirm' + name].updateValueAndValidity());
    }
  }

  parserNumber(value: string): number {
    return !!value ? parseInt(value, 0) : 0;
  }

  onChangeValue(column: FormModel, value, status = 'change'): void {
    if (!!column.formItem.autoSet) {
      column.formItem.autoSet(value, this.validateForm, status);
    }
    if (column.formItem.type === 'autocomplete') {
      column.formItem.listAutocomplete = column.formItem.list.filter(item => item.label.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }
    this.$columns.map((columns, indexColumns) => {
      columns.map((item, indexItem) => {
        if (item.formItem && item.formItem.condition) {
          const statusCondition = item.formItem.condition(this.validateForm.value);
          this.validateForm.controls[item.name][statusCondition ? 'enable' : 'disable']();
          this.$columns[indexColumns][indexItem].formItem.show = statusCondition;
        }
      });
    });
  }

  submitForm(): void {
    this.isLoading = false;
    const {controls, statusChanges} = this.validateForm;
    for (const i in controls) {
      if (controls.hasOwnProperty(i)) {
        controls[i].markAsTouched();
        controls[i].updateValueAndValidity();
      }
    }
    if (this.validateForm.status !== 'INVALID') {
      this.isLoading = true;
    }
    if (this.validateForm.status === 'PENDING') {
      const formStatusChanges$ = statusChanges.subscribe(data => {
        this.handSubmit.emit(this.validateForm);
        formStatusChanges$.unsubscribe();
      });
    } else {
      this.handSubmit.emit(this.validateForm);
    }
  }
}










