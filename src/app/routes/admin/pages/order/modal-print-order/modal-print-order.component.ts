import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';

import {NzMessageService} from 'ng-zorro-antd/message';

import {BaseComponent} from '@components/base-component';
import {AdminService} from '@routes/admin/admin.service';
import {OrderService} from '@routes/admin/pages/order/order.service';

@Component({
  selector: 'app-modal-print-order',
  templateUrl: './modal-print-order.component.html',
  styles: [
  ],
  encapsulation: ViewEncapsulation.None
})
export class ModalPrintOrderComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() listOrder;
  @Input() isVisible;
  @Output() cancelModal = new EventEmitter<string>();

  isVisiblePrint = false;
  listOrderPrint = [];

  constructor(
    protected service: OrderService,
    protected message: NzMessageService,
    protected route: ActivatedRoute,
    protected adminService: AdminService,
    protected sanitizer: DomSanitizer,
  ) {
    super(route, adminService, message, service);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible) {
      if (changes.isVisible.currentValue) {
        this.listOrderPrint = [];
        const listOrderPrint = [...this.listOrder];
        for (let index = 0; index < listOrderPrint.length; index++) {
          const order = listOrderPrint[index];
          let totalSum = 0;
          this.getBarcode(order, index);
          order.invoiceItems.map(x => {
            totalSum += x.quantity * parseFloat(x.importUnitPrice);
            return x;
          });
          this.listOrderPrint.push({
            ...order,
            totalSum,
          });
        }
        this.isVisiblePrint = true;
      } else {
        if (this.isVisiblePrint) {
          this.handleCancelPrint();
        }
      }
    }
  }

  handleCancelPrint(): void {
    this.isVisiblePrint = false;
    this.cancelModal.emit();
  }

  getBarcode(orderInfo, index): void {
    this.service
      .getBase64Barcode({
        code: orderInfo.invoiceShipping.vnPostOrderCode,
        height: 90,
        width: 320,
      })
      .subscribe(
        () => {},
        (err) => {
          const code = `data:image/gif;base64,` + err.text;
          this.listOrderPrint[index].barCode1 = this.sanitizer.bypassSecurityTrustUrl(code);
        }
      );
    if (orderInfo.type !== 'SHPE') {
      this.service
        .getBase64Barcode({
          code: orderInfo.invoiceShipping.vnPostDistributedCode,
          height: 50,
          width: 160,
        })
        .subscribe(
          () => {},
          (err) => {
            const code = `data:image/gif;base64,` + err.text;
            this.listOrderPrint[index].barCode2 = this.sanitizer.bypassSecurityTrustUrl(code);
          }
        );
    }
  }

  handlePrintAction(): void {
    this.actionPrint(document.getElementById('printOrder'));
    this.service.updatePrintCount({
      ids: this.listOrderPrint.map(x => x.id)
    }).subscribe();
  }

  actionPrint(el): void {
    const win = window.open('', 'Print', 'height=800,width=800');
    win.document.write(`<html><head></head><body></body></html>`);
    const head = win.document.querySelector('head');
    document.querySelectorAll('style, link').forEach(node => {
      head.appendChild(node.cloneNode(true));
    });
    win.document.querySelector('body').innerHTML = el.outerHTML;
    win.document.close();

    win.focus();
    // Waiting dom rendering to completed
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  }
}
