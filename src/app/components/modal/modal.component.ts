import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-geneat-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalComponent implements OnInit {
  @Input() loading: boolean;
  @Input() title: string;
  @Input() visible = false;
  @Input() contentModal: any;
  @Input() extendFooterButton: any;
  @Input() width = 1200;
  @Input() notFooter = false;
  @Input() okDisabled = false;
  @Input() okHidden = true;
  @Input() keyboard = false;
  @Input() classModal = '';

  @Output() clickOk = new EventEmitter();
  @Output() clickCancel = new EventEmitter();

  langPrefix = 'components.ModalForm';
  @Input() okText: string;

  constructor() { }

  ngOnInit(): void {
  }
  afterOpen(): void {
    const modals: HTMLCollectionOf<Element> = document.getElementsByClassName('ant-modal');
    for (let i = 0; i < modals.length; i++) {
      if (((modals[i].scrollHeight + 15) < window.innerHeight && !modals[i].querySelector('.ant-spin-spinning')) && !modals[i].classList.contains('modal-not-center')) {
        modals[i].parentElement.classList.remove('no-center');
      } else {
        modals[i].parentElement.classList.add('no-center');
      }
      setTimeout(() => {
        modals[i].children[0]['style'].minHeight = modals[i].children[0]['offsetHeight'] + 'px';
        }, 500);
    }
  }

  handleCancel(): void {
    this.clickCancel.emit();
  }

  handleOk(validateForm): void {
    this.clickOk.emit(validateForm);
  }
}
