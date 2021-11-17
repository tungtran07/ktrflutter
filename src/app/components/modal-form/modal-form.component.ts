import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';

import {FormModel} from '@components/form/form.model';

@Component({
  selector: 'app-geneat-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalFormComponent implements OnInit {
  @Input() columns: FormModel[];
  @Input() loading: boolean;
  @Input() firstLoad = true;
  @Input() values: any;
  @Input() widthLabel = 100;
  @Input() title: string;
  @Input() col = 1;
  @Input() visible = false;
  @Input() extendModalTop: any;
  @Input() extendModalLeft: any;
  @Input() widthModalLeft: any;
  @Input() extendModal: any;
  @Input() extendFooterButton: any;
  @Input() width = 1200;
  @Input() okText;
  @Input() classModal = '';
  @Input() showForm = true;
  @Input() okDisabled = false;
  @Input() okHidden = true;

  @Output() clickOk = new EventEmitter();
  @Output() clickCancel = new EventEmitter();

  @ViewChild('myForm') ngForm;

  isLoading = false;
  langPrefix = 'components.ModalForm';

  constructor() { }

  ngOnInit(): void {}

  handleOk(validateForm): void {
    if (validateForm || !this.ngForm) {
      this.clickOk.emit(this.ngForm?.validateForm);
    } else {
      this.isLoading = false;
      this.ngForm.isLoading = false;
      const {controls, statusChanges} = this.ngForm.validateForm;
      for (const i in controls) {
        if (controls.hasOwnProperty(i)) {
          controls[i].markAsDirty();
          controls[i].updateValueAndValidity();
        }
      }

      if (this.ngForm.validateForm.status !== 'INVALID') {
        this.isLoading = true;
        this.ngForm.isLoading = true;
      }
      if (this.ngForm.validateForm.status === 'PENDING') {
        statusChanges.subscribe(data => {
          this.clickOk.emit(this.ngForm.validateForm);
        });
      } else {
        this.clickOk.emit(this.ngForm.validateForm);
      }
    }
  }
  handleCancel(): void {
    this.clickCancel.emit();
  }
}
