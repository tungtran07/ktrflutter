import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

import {OrderService} from '@routes/admin/pages/order/order.service';

@Component({
  selector: 'app-modal-print-barcode',
  templateUrl: './modal-print-barcode.component.html',
  styles: [
  ],
  encapsulation: ViewEncapsulation.None
})
export class ModalPrintBarcodeComponent implements OnInit, OnChanges {
  @Input() list;
  @Input() isVisible;
  @Output() cancelModal = new EventEmitter<string>();

  isVisibleBarcode = false;
  listPrintBarcode = [];
  listFinalPrintBarcode = [];
  listImagePrintBarcode = [];
  widthPrint = '220';
  heightPrint = '90';
  offsetPrint = '0';
  data;

  constructor(
    protected serviceOrder: OrderService,
    protected sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isVisible) {
      if (changes.isVisible.currentValue) {
        this.handlePrintBarcode(this.list);
      } else {
        if (this.isVisibleBarcode) {
          this.handleCancelBarcode();
        }
      }
    }
  }

  handleCancelBarcode(): void {
    this.isVisibleBarcode = false;
    this.cancelModal.emit();
  }
  handleOkBarcode(): void {
    this.listFinalPrintBarcode = [];
    let _index = 0;
    Array(parseInt(this.offsetPrint, 0)).fill(0).forEach(() => {
      if (_index % 5 === 0) {
        this.listFinalPrintBarcode.push([]);
      }
      this.listFinalPrintBarcode[this.listFinalPrintBarcode.length - 1].push({code: null, name: null});
      _index += 1;
    });
    this.listPrintBarcode.map((product, index) => {
      product.list.map(item => {
        if (item.quantityPrint > 0) {
          const _code = item.code + '_' + item.size;
          this.listImagePrintBarcode[_code] = null;
          this.serviceOrder
            .getBase64Barcode({
              code: _code,
              height: this.heightPrint,
              width: this.widthPrint,
            })
            .subscribe(
              () => {},
              (err) => {
                const code = `data:image/gif;base64,` + err.text;
                this.listImagePrintBarcode[_code] = this.sanitizer.bypassSecurityTrustUrl(code);
                const lengthObject = Object.values(this.listImagePrintBarcode);
                if (lengthObject.filter(itemSub => !!itemSub).length === lengthObject.length) {
                  Array(this.listFinalPrintBarcode.length % 5).fill(0).forEach(() => {
                    if (_index % 5 === 0) {
                      this.listFinalPrintBarcode.push([]);
                    }
                    this.listFinalPrintBarcode[this.listFinalPrintBarcode.length - 1].push({code: null, name: null});
                    _index += 1;
                  });
                  setTimeout(() => {
                    const win = window.open('', 'Print', 'height=800,width=800');
                    win.document.write(`<html><head></head><body></body></html>`);
                    const head = win.document.querySelector('head');
                    document.querySelectorAll('style, link').forEach(node => {
                      head.appendChild(node.cloneNode(true));
                    });
                    // Force border color & text color
                    // window.location.host
                    // const printStyle = win.document.createElement('style');
                    // printStyle.innerHTML = `*, .text-grey {border-color: #aaa !important;color: #000 !important;}`;
                    // head.appendChild(printStyle);
                    win.document.querySelector('body').innerHTML = document.getElementById('printProduct').outerHTML;
                    win.document.close();

                    win.focus();
                    // Waiting dom rendering to completed
                    setTimeout(() => {
                      win.print();
                      win.close();
                    }, 500);
                  }, 500);
                }
              }
            );
          Array(parseInt(item.quantityPrint, 0)).fill(0).forEach(() => {
            if (_index % 5 === 0) {
              this.listFinalPrintBarcode.push([]);
            }
            this.listFinalPrintBarcode[this.listFinalPrintBarcode.length - 1].push({code: _code, name: `${item.name} (${item.size})`});
            _index += 1;
          });
        }
      });
    });

  }

  handlePrintBarcode(array, status = true): void {
    if (status) {
      this.listPrintBarcode = [];
    }

    array.map((data, index) => {
      const _code = data.code + '_' + '36';
      if (status) {
        this.widthPrint = (200 + ((data.code.length - 1) * 20)).toString();
        this.listPrintBarcode.push({name: data.name, list: []});
        const {code, id, name, sizeWithQuantity} = data;
        sizeWithQuantity.map(({size, quantity}) =>
          this.listPrintBarcode[this.listPrintBarcode.length - 1].list.push({
            code, id, name, quantityPrint: 0, size, quantity
          })
        );
      }
      if (index === 0) {
        this
          .serviceOrder
          .getBase64Barcode({
            code: _code,
            height: this.heightPrint,
            width: this.widthPrint,
          })
          .subscribe(
            () => {
            },
            (err) => {
              const _code = `data:image/gif;base64,` + err.text;
              data.barcode = this.sanitizer.bypassSecurityTrustUrl(_code);
              this.data = data;
              if (status) {
                this.isVisibleBarcode = true;
              }
            });
      }
    });
  }

  handleSetQuantityPrint(data, index, indexTop): void {
    this.listPrintBarcode[indexTop].list[index].quantityPrint = data;
  }
}
