import {finalize} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

import {DatatableModel} from '@components/datatable/datatable.model';

export function columns(self): DatatableModel[] {
  return [
    {
      name: 'createdOnDate',
      title: 'routes.Admin.Order.createdOnDate',
      tableItem: {
        width: '120px',
        sort: null,
        filter: {
          type: 'date',
          visible: false,
          value: null,
        },
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (data) => self.formatDate(data.createdOnDate),
      }
    },
    {
      name: 'orderNo',
      title: 'routes.Admin.Order.orderNo',
      tableItem: {
        width: '200px',
        sort: null,
        filter: {
          type: 'search',
          value: null,
          visible: false,
        },
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        onClick: (item) => self.handleDetail(item),
        render: (data) => {
          let order = `<strong>${data.orderNo}</strong>`;
          if (self.user.level > 8 && self.status !== 'WAIT_CONFIRM' && self.status !== 'DRAFT' && self.status !== 'WHSL_COMPLETED' && data.isScanValidated !== null) {
            if (data.isScanValidated) {
              order += '<span class="label-item ko">KO</span>';
            } else {
              order += '<span class="label-item kl">KL</span>';
            }
          }
          switch (data.type) {
            case 'SHPE':
              order += '<span class="label-item shpe">S</span>';
              break;
            case 'PREP':
              order += '<span class="label-item prep">CK</span>';
              break;
            case 'WHSL':
              order += '<span class="label-item whsl">Sỉ</span>';
              break;
          }
          return order;
        },
      }
    },
    {
      name: 'type',
      title: 'routes.Admin.Order.type',
      formItem: {
        type: !self.data?.id ? 'radio' : 'only-text',
        render: (values) => 'routes.Admin.Order.' + values['type'],
        list: [
          {label: 'routes.Admin.Order.RETL', value: 'RETL'},
          {label: 'routes.Admin.Order.PREP', value: 'PREP'},
          {label: 'routes.Admin.Order.SHPE', value: 'SHPE'},
          self.user.level > 8 && {label: 'routes.Admin.Order.WHSL', value: 'WHSL'},
        ],
        autoSet: (value, validation, status) => self.handleChangeType(value),
        rules: [{type: 'required'}],
      },
    },
    {
      name: 'shopeeOrderNo',
      title: 'Mã đơn Shopee',
      formItem: {
        show: false,
        condition: (item) => item.type === 'SHPE',
        rules: [{type: 'required'}],
        placeholder: 'Nhập mã đơn Shopee',
        autoSet: (value, validation, status) => {
          if (status === 'blur' && value && !self.isLoading) {
            setTimeout(() => {
              self.isLoading = true;
              self.service.checkNoShoppe(value)
                .pipe(finalize(() => self.isLoading = false))
                .subscribe(({data}) => {
                  self.messageWarningNo = '';
                  self.messageErrorNo = '';
                  if (data.isWarning) {
                    self.messageWarningNo = data.warningMessage;
                  }
                  if (!data.isValid) {
                    self.messageErrorNo = data.validateMessage;
                  }
                });
            }, 500);
          }
        }
      },
    },
    {
      name: 'shippingCarrier',
      title: 'Đơn vị vận chuyển',
      formItem: {
        show: false,
        condition: (item) => item.type === 'SHPE',
        type: 'select',
        list: self.listShippingCarrier,
        rules: [{type: 'required'}],
      }
    },
    {
      name: 'vnPostOrderCode',
      title: 'routes.Admin.Order.vnPostOrderCode',
      tableItem: self.listAllowPostOrderCode.indexOf(self.status) === -1 && {
        width: '115px',
        sort: null,
        filter: {
          type: 'search',
          value: null,
          visible: false,
        },
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (data) => `${data.invoiceShipping.vnPostOrderCode ? data.invoiceShipping.vnPostOrderCode : ''}`,
      },
    },
    // {
    //   name: 'isScanValidated',
    //   title: 'Trạng thái kiểm',
    //   tableItem: (self.user.level > 8 && self.status !== 'WAIT_CONFIRM' && self.status !== 'DRAFT' && self.status !== 'WHSL_COMPLETED') && {
    //     bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
    //     width: '130px',
    //     align: 'center',
    //     actions: [
    //       {
    //         condition: (item) => item.isScanValidated !== null,
    //         text: (item) => item.isScanValidated ? 'KO' : 'KL',
    //         bgColor: (item) => item.isScanValidated ? '#318200' : '#EB445A',
    //       },
    //     ]
    //   },
    // },
    {
      name: 'shipperCompanyName',
      title: 'Vận chuyển',
      tableItem: {
        width: '110px',
        align: 'center',
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (data) => data.invoiceShipping?.shipperCompanyName ? data.invoiceShipping?.shipperCompanyName : ''
      },
    },
    {
      name: 'createdByUser',
      title: 'CTV',
      tableItem: {
        width: '150px',
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (data) => data.createdByUser
      },
    },
    {
      name: 'customerName',
      title: 'routes.Admin.Order.customerName',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        rules: [{type: 'required'}],
        placeholder: 'Nhập tên khách hàng'
      },
    },
    {
      name: 'customerPhone',
      title: 'routes.Admin.Order.customerPhone',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        type: 'mask',
        mask: '0000000000',
        maskPrefix: '0',
        rules: [
          {type: 'required'},
          {type: 'maxlength', value: 10, message: 'Số điện thoại sai định dạng'},
          {type: 'minlength', value: 10, message: 'Số điện thoại sai định dạng'},
        ],
        placeholder: 'Nhập số điện thoại khách hàng',
        autoSet: (value, validation, status) => {
          if (status === 'blur' && value && value.length === 10 && !self.isLoading) {
            setTimeout(() => {
              self.isLoading = true;
              self.service.getByPhone(value)
                .pipe(finalize(() => self.isLoading = false))
                .subscribe(({data}) => {
                  if (data.isWarning) {
                    self.warningShipReturn = data.warningMessage;
                    // self.message.warning(data.warningMessage);
                  } else {
                    self.warningShipReturn = '';
                  }
                });
            }, 1000);
          }
        }
      },
    },
    {
      name: 'customerProvinceId',
      title: 'routes.Admin.Order.customerProvince',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        type: 'select',
        list: self.listProvince,
        customSelectContent: (item) => {
          if (item.shippingStatus) {
            const shippingStatus = self.getShippingStatus(item.shippingStatus);
            return `<div class="flex between"><span>${item.label}</span><span class="label-item ${shippingStatus.class}">${shippingStatus.name}</span></div>`;
          }
          return `<div><span>${item.label}</span></div>`;
        },
        rules: [{type: 'required'}],
        autoSet: (value, validation) => {
          if (validation.controls.customerDistrictId.value) {
            validation.controls.customerDistrictId.setValue(null);
          }
          if (validation.controls.customerCommuneId.value) {
            validation.controls.customerCommuneId.setValue(null);
          }
          if (value) {
            self.isLoading = true;
            self.service.getDistrict(value)
              .pipe(finalize(() => self.isLoading = false))
              .subscribe(res => {
                if (self.listDistrict.length > 0) {
                  for (let i = self.listDistrict.length - 1; i >= 0; i--) {
                    self.listDistrict.splice(self.listDistrict[i], 1);
                  }
                }
                if (self.listCommune.length > 0) {
                  for (let i = self.listCommune.length - 1; i >= 0; i--) {
                    self.listCommune.splice(self.listCommune[i], 1);
                  }
                }
                res.data.map(item => self.listDistrict.push({value: item.districtCode, label: item.districtName, ...item}));
              });
          }
        }
      }
    },
    {
      name: 'customerDistrictId',
      title: 'routes.Admin.Order.customerDistrict',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        type: 'select',
        list: self.listDistrict,
        customSelectContent: (item) => {
          if (item.shippingStatus) {
            const shippingStatus = self.getShippingStatus(item.shippingStatus);
            return `<div class="flex between"><span>${item.label}</span><span class="label-item ${shippingStatus.class}">${shippingStatus.name}</span></div>`;
          }
          return `<div><span>${item.label}</span></div>`;
        },
        rules: [{type: 'required'}],
        autoSet: (value, validation) => {
          if (validation.controls.customerCommuneId.value) {
            validation.controls.customerCommuneId.setValue(null);
          }
          if (value) {
            self.isLoading = true;
            self.service.getCommune(value)
              .pipe(finalize(() => self.isLoading = false))
              .subscribe(res => {
                if (self.listCommune.length > 0) {
                  for (let i = self.listCommune.length - 1; i >= 0; i--) {
                    self.listCommune.splice(self.listCommune[i], 1);
                  }
                }
                res.data.map(item => self.listCommune.push({value: item.communeCode, label: item.communeName}));
              });
          }
        }
      }
    },
    {
      name: 'customerCommuneId',
      title: 'routes.Admin.Order.customerCommune',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        type: 'select',
        list: self.listCommune,
        rules: [{type: 'required'}],
      }
    },
    {
      name: 'customerApartmentNumber',
      title: 'routes.Admin.Order.customerApartmentNumber',
      formItem: {
        condition: (item) => item.type !== 'SHPE',
        type: 'textarea',
        rules: [{type: 'required'}],
        placeholder: 'Nhập địa chỉ cụ thể (số nhà, tên đường, ngõ, xóm)'
      }
    },
    {
      name: 'customerNote',
      title: 'routes.Admin.Order.customerNote',
      formItem: {}
    },
    {
      name: 'totalItem',
      title: 'routes.Admin.Order.totalItem',
      tableItem: {
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (item) => {
          let data = [...item.invoiceItems];
          data = data.map(sub => `${sub.quantity}x${sub.name} (${sub.size})`);
          return '<span class="gn-one-line">' + data.join(',') + '</span>';
        },
      },
    },
    {
      name: 'status',
      title: 'routes.Admin.Order.status',
      tableItem: {
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        width: '90px',
        actions: [
          {
            text: (item) => 'routes.Admin.Order.' + (item.status !== 'WHSL_COMPLETED' ? item.status : 'COMPLETED'),
            bgColor: (item) => self.listColorStatus[item.status],
          },
        ]
      },
    },
    {
      name: 'total',
      title: 'routes.Admin.Order.total',
      tableItem: {
        width: '100px',
        align: 'right',
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        render: (item) => self.formatCurrency(item.total.toString())
      },
    },
    {
      name: 'printCount',
      title: 'routes.Admin.Order.printCount',
      tableItem: (self.user.level > 8 && self.status === 'INPROCESS') && {
        width: '60px',
        align: 'right',
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
      },
    },
    {
      name: '',
      title: 'routes.Admin.Order.action',
      tableItem: self.listWidthStatus[self.status] ? {
        width: self.listWidthStatus[self.status],
        align: 'left',
        bgColor: (data) => self.user.level > 8 && self.status === 'INPROCESS' && data.printCount === 0 ? '#fadb1466' : '#ffffff',
        actions: [
          {
            text: () => 'routes.Admin.Order.action',
            bgColor: () => '#318200',
            templateDropdown: self.contentDropdownTemplate,
            // confirm: true,
            // condition: (item) => !!item.allowedActions && item.allowedActions.indexOf('EDIT') > -1,
            onClick: (item) => self.handleShowAllowStatus(item)
          }
        ],
      } : null,
    },
  ];
}

export function columnsProduct(self, status = false, statusOrder = ''): DatatableModel[] {
  return [
    {
      name: 'imageUrl',
      title: 'routes.Admin.Product.imageUrl',
      tableItem: {
        width: '60px',
        show: {
          type: 'image',
          left: (data) => data.discountPercent > 0 ? '-' + data.discountPercent + '%' : null,
          right: (data) => data.isFreeShip ? 'Freeship' : null,
        },
      },
    },
    {
      name: 'name',
      title: 'routes.Admin.Product.name',
      tableItem: {
        render: (item) => `<span class="gn-one-line">${item.name}</span>`
      },
    },
    {
      name: 'itemId',
      title: 'routes.Admin.Product.product',
      formItem: {
        type: 'select',
        list: self.listProduct,
        rules: [{type: 'required'}],
        onSearch: (value) => {
          self.service.getListProduct({
            page: 1,
            size: 10,
            filter: JSON.stringify({fullTextSearch: value})
          }).subscribe(res => {
            if (self.listProduct.length > 0) {
              for (let i = self.listProduct.length - 1; i >= 0; i--) {
                self.listProduct.splice(self.listProduct[i], 1);
              }
            }
            res.data.content.map(item => self.listProduct.push({...item, value: item.id, label: item.name}));
          });
        },
        autoSet: (value, validation) => {
          validation.controls.size.setValue(null);
          validation.controls.quantity.setValue(1);
          if ((self.typeOrder !== 'PREP' && self.typeOrder !== 'SHPE')) {
            validation.controls.retailUnitPrice.setValue(null);
            validation.controls.interest.setValue(null);
          }

          if (value) {
            if (self.listProductSize.length > 0) {
              for (let i = self.listProductSize.length - 1; i >= 0; i--) {
                self.listProductSize.splice(self.listProductSize[i], 1);
              }
            }
            self.productSelect = self.listProduct.filter(item => item.id === value)[0];
            self.service.getSuggestedPrices(self.productSelect.id).subscribe(({data}) => {
              self.suggestedPrices = data.suggestedPrices;
              self.minimumPrice = data.minimumPrice;
              self.setPrice = (price) => validation.controls.retailUnitPrice.setValue(price);
            });
            validation.controls.code.setValue(self.productSelect.code);
            self.productSelect.sizeWithQuantity.filter(item => item.quantity > 0).map(item => self.listProductSize.push({
              value: item.size,
              label: item.size,
              danger: item.quantity < 4
            }));
          }
        }
      },
    },
    {
      name: 'code',
      title: 'routes.Admin.Product.code',
      tableItem: {
        render: (item) => `<span class="gn-one-line">${item.code}</span>`
      },
      formItem: {
        readonly: true,
      }
    },
    {
      name: 'size',
      title: 'routes.Admin.Product.size',
      tableItem: {
        width: '100px',
        align: 'right',
      },
      formItem: {
        type: 'radio',
        list: self.listProductSize,
        rules: [{type: 'required'}]
      },
    },
    {
      name: 'quantity',
      title: 'SL',
      tableItem: {
        width: '50px',
        align: 'right',
      },
      formItem: {
        value: 1,
        title: () => 'Số lượng',
        type: 'number',
        rules: [
          {type: 'required'},
          {type: 'min', value: 0},
        ]
      },
    },
    {
      name: 'resellerUnitPrice1',
      title: 'routes.Admin.Product.resellerUnitPrice1',
      tableItem: {
        width: '120px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ? `<span>${self.formatCurrency((product.resellerUnitPrice1 - ((product.resellerUnitPrice1 * product.discountPercent) / 100)))}</span>` : ''}<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice1)}</span>`
      },
    },
    {
      name: 'resellerUnitPrice2',
      title: 'routes.Admin.Product.resellerUnitPrice2',
      tableItem: {
        width: '100px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ? `<span>${self.formatCurrency((product.resellerUnitPrice2 - ((product.resellerUnitPrice2 * product.discountPercent) / 100)))}</span>` : ''}<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice2)}</span>`
      },
    },
    {
      name: 'resellerUnitPrice3',
      title: 'routes.Admin.Product.resellerUnitPrice3',
      tableItem: {
        width: '100px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ? `<span>${self.formatCurrency((product.resellerUnitPrice3 - ((product.resellerUnitPrice3 * product.discountPercent) / 100)))}</span>` : ''}<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice3)}</span>`
      },
    },
    {
      name: 'resellerUnitPrice',
      title: 'Giá CTV',
      tableItem: {
        width: '80px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ? `<span>${self.formatCurrency((product.resellerUnitPrice - ((product.resellerUnitPrice * product.discountPercent) / 100)))}</span>` : ''}<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice)}</span>`
      },
    },
    {
      name: 'retailUnitPrice',
      title: 'routes.Admin.Order.retailUnitPrice',
      tableItem: (self.typeOrder !== 'PREP' && self.typeOrder !== 'SHPE') && {
        width: '80px',
        align: 'right',
        render: (item) => self.formatCurrency(item.retailUnitPrice)
      },
      formItem: (self.typeOrder !== 'PREP' && self.typeOrder !== 'SHPE') && {
        col: 12,
        type: 'mask',
        number: true,
        addOnAfter: 'đ',
        rules: [
          {type: 'required'},
          {type: 'min', value: 0},
          {
            type: 'custom',
            validator: (control: FormControl) => {
              if (!control.value || control.value < 1 || !self.productSelect.id) {
                return {required: true};
              } else {
                if (!control.valueChanges) {
                  return {required: true};
                } else {
                  control.valueChanges
                    // .pipe(debounceTime(1000), switchMap(value => self.service.getSuggestedPrices(self.productSelect.id)))
                    .subscribe(({data}) => {
                      if (self.minimumPrice > parseInt(control.value, 0)) {
                        control.setErrors({custom: {message: 'Giá bán không được dưới ' + self.formatCurrency(self.minimumPrice)}});
                      } else {
                        setTimeout(() => {
                          if (self.formComponent.ngForm) {
                            self.formComponent.ngForm.validateForm.controls.interest.setValue(control.value - self.minimumPrice);
                          }
                        });
                        control.setErrors(null);
                      }
                    });
                }
              }
            },
          }
        ]
      },
    },
    {
      name: 'interest',
      title: 'Lãi dự kiến',
      formItem: (self.typeOrder !== 'PREP' && self.typeOrder !== 'SHPE') && {
        col: 12,
        readonly: true,
        type: 'mask',
        number: true,
        addOnAfter: 'đ',
      }
    },
    {
      name: 'isOutOfStock',
      title: 'Trạng thái',
      tableItem: statusOrder === 'OUT_OF_STOCK' && {
        width: '100px',
        align: 'center',
        actions: [
          {
            text: (item) => !item.isOutOfStock ? 'Còn hàng' : 'Hết hàng',
            bgColor: (item) => !item.isOutOfStock ? '#318200' : '#EB445A',
          },
        ]
      },
    },
    {
      name: '',
      title: 'routes.Admin.Order.action',
      tableItem: (!status && (!self.data?.id || (!!self.data?.id && self.data.type !== 'PREP' && self.data.type !== 'SHPE'))) && {
        width: '110px',
        actions: [
          {
            text: () => 'routes.Admin.Order.edit',
            onClick: (item, index) => self.handleEditProduct(item, index)
          },
          {
            text: () => 'routes.Admin.Order.delete',
            bgColor: () => '#ec3737',
            confirm: true,
            onClick: (item, index) => self.handleDeleteProduct(index)
          }
        ],
      },
    },
  ];
}

export function columnsThongTinTrangThai(self): DatatableModel[] {
  return [
    {
      name: 'taiBuuCuc',
      title: 'routes.Admin.Order.buuCuc',
      tableItem: {
        width: '280px',
      },
    },
    {
      name: 'ngayGioPhat',
      title: 'routes.Admin.Order.ngayGio',
      tableItem: {
        width: '110px',
        render: (data) => self.formatDate(data.ngayGioPhat),
      },
    },
    {
      name: 'trangThai',
      title: 'routes.Admin.Order.status',
      tableItem: {},
    },
  ];
}

export function columnsThongTinPhat(self): DatatableModel[] {
  return [
    {
      name: 'buuCucPhat',
      title: 'routes.Admin.Order.buuCuc',
      tableItem: {
        width: '200px',
      },
    },
    {
      name: 'ngayGioPhat',
      title: 'routes.Admin.Order.ngayGio',
      tableItem: {
        width: '110px',
        render: (data) => self.formatDate(data.ngayGioPhat),
      },
    },
    {
      name: 'trangThaiPhat',
      title: 'routes.Admin.Order.status',
      tableItem: {},
    },
  ];
}

export function columnsOutStock(self): DatatableModel[] {
  return [
    {
      name: 'imageUrl',
      title: 'routes.Admin.Product.imageUrl',
      tableItem: {
        width: '60px',
        show: {
          type: 'image',
          left: (data) => data.discountPercent > 0 ? '-' + data.discountPercent + '%' : null,
          right: (data) => data.isFreeShip ? 'Freeship' : null,
        },
      },
    },
    {
      name: 'name',
      title: 'routes.Admin.Product.name',
      tableItem: {
        render: (item) => `<span class="gn-one-line">${item.name}</span>`
      },
    },
    {
      name: 'size',
      title: 'routes.Admin.Product.size',
      tableItem: {
        width: '80px',
        align: 'right',
      },
    },
    {
      name: 'quantity',
      title: 'SL',
      tableItem: {
        width: '50px',
        align: 'right',
      },
    },
    {
      name: 'isOutOfStock',
      title: 'Trạng thái',
      tableItem: {
        width: '100px',
        align: 'center',
        actions: [
          {
            text: (item) => !item.isOutOfStock ? 'Còn hàng' : 'Hết hàng',
            bgColor: (item) => !item.isOutOfStock ? '#318200' : '#EB445A',
            onClick: (item) => item.isOutOfStock = !item.isOutOfStock
          },
        ]
      },
    },
  ];
}
