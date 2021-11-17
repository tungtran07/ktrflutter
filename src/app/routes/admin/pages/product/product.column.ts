import {DatatableModel} from '@components/datatable/datatable.model';

export function columns(self): DatatableModel[] {
  return [
    {
      name: 'imageUrl',
      title: self.langPrefix + '.imageUrl',
      tableItem: {
        width: '60px',
        show: {
          type: 'image',
          left: (data) => data.discountPercent > 0 ? `-${data.discountPercent}%` : null,
          right: (data) => data.isFreeShip ? 'Freeship' : null,
        },
      },
    },
    {
      name: 'code',
      title: self.langPrefix + '.code',
      tableItem: {
        width: '180px',
        render: (item) => `<span class="gn-one-line">${item.code}</span>`
      },
      formItem: {
        title: () => 'Mã sản phẩm',
        rules: [ { type: 'required' } ],
      },
    },
    {
      name: 'name',
      title: self.langPrefix + '.name',
      tableItem: {
        onClick: (item) => self.handleDetail(item),
        render: (item) => `<span class="gn-one-line">${item.name}</span>`
      },
      formItem: {
        title: () => 'Tên sản phẩm',
        rules: [ { type: 'required' } ]
      },
    },
    {
      name: 'location',
      title: self.langPrefix + '.location',
      tableItem: {
        width: '60px',
      },
      formItem: {},
    },
    {
      name: 'itemTypeId',
      title: self.langPrefix + '.itemTypeId',
      tableItem: {
        width: '90px',
        filter: {
          type: 'radio',
          visible: false,
          value: null,
          list: self.listTypeProduct.map(item => ({value: item.id, label: item.name}))
        },
        render: (data) => (data.itemTypeId && self.listTypeProduct.length)
          && self.listTypeProduct.filter(item => item.id === data.itemTypeId)[0].name
      },
      formItem: {
        title: () => 'Loại sản phẩm',
        type: 'select',
        list: self.listTypeProduct.map(item => ({value: item.id, label: item.name}))
      },
    },
    {
      name: 'unit',
      title: 'Đơn vị tính',
      formItem: {
        type: 'select',
        value: 'Đôi',
        list: [
          { value: 'Đôi', label: 'Đôi' },
          { value: 'Chiếc', label: 'Chiếc' },
        ]
      },
    },
    {
      name: 'status',
      title: self.langPrefix + '.status',
      formItem: {
        type: 'radio',
        list: [
          { value: 'SALE', label: 'Đang bán'},
          { value: 'NOTSALE', label: 'Ngưng bán'}
        ]
      },
    },
    {
      name: 'isFreeShip',
      title: self.langPrefix + '.isFreeShip',
      formItem: {
        type: 'checkbox',
      },
    },
    {
      name: 'grossWeight',
      title: self.langPrefix + '.grossWeight',
      tableItem: {
        width: '40px',
        align: 'right',
      },
      formItem: {
        title: () => 'Khối lượng',
        addOnAfter: 'gram',
        type: 'number',
        rules: [ { type: 'required' } ]
      },
    },
    {
      name: 'resellerUnitPrice1',
      title: self.langPrefix + '.resellerUnitPrice1',
      tableItem: {
        width: '120px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ?
          `<span>${self.formatCurrency((product.resellerUnitPrice1 - ((product.resellerUnitPrice1 * product.discountPercent) / 100)))}</span>` : ''
        }<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice1)}</span>`
      },
      formItem: {
        type: 'mask',
        addOnAfter: 'đ',
        number: true,
        rules: [ { type: 'required' } ]
      },
    },
    {
      name: 'resellerUnitPrice2',
      title: self.langPrefix + '.resellerUnitPrice2',
      tableItem: {
        width: '100px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ?
          `<span>${self.formatCurrency((product.resellerUnitPrice2 - ((product.resellerUnitPrice2 * product.discountPercent) / 100)))}</span>` : ''
        }<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice2)}</span>`
      },
      formItem: {
        type: 'mask',
        addOnAfter: 'đ',
        number: true,
        rules: [ { type: 'required' } ]
      },
    },
    {
      name: 'resellerUnitPrice3',
      title: self.langPrefix + '.resellerUnitPrice3',
      tableItem: {
        width: '100px',
        align: 'right',
        render: (product) => `${product.discountPercent > 0 ?
          `<span>${self.formatCurrency((product.resellerUnitPrice3 - ((product.resellerUnitPrice3 * product.discountPercent) / 100)))}</span>` : ''
        }<span class='${product.discountPercent === 0 ? '' : 'before-discount-price'}'>${self.formatCurrency(product.resellerUnitPrice3)}</span>`
      },
      formItem: {
        type: 'mask',
        addOnAfter: 'đ',
        number: true,
        rules: [ { type: 'required' } ]
      },
    },
    {
      name: 'importUnitPrice',
      title: self.langPrefix + '.importUnitPrice',
      // tableItem: {
      //   width: '100px',
      //   render: (item) => self.formatCurrency(item.importUnitPrice)
      // },
      formItem: {
        type: 'mask',
        addOnAfter: 'đ',
        number: true,
      },
    },

    {
      name: 'discountPercent',
      title: self.langPrefix + '.discountPercent',
      formItem: {
        addOnAfter: '%',
        type: 'number',
      },
    },
    //
    {
      name: 'storageLinkedItemId',
      title: 'SP liên kết',
      tableItem: {
        width: '80px',
        align: 'center',
        render: (product) => `${product.storageLinkedItemId ? ' <i class="las la-lg la-link"></i>' : ''}`
      },
      formItem: !self.data?.storageLinkedItemId && {
        type: 'select',
        list: self.listProduct,
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
          self.storageLinkedItemId = value;
        }
      },
    },
    {
      name: '',
      title: 'routes.Admin.Order.action',
      tableItem: self.user && self.user.level > 8 && {
        width: '120px',
        actions: [
          {
            text: () => 'routes.Admin.Order.edit',
            onClick: (item, index) => self.handleEdit(item, index)
          },
          self.user.level === 10 && {
            text: () => 'routes.Admin.Order.delete',
            bgColor: () => '#ec3737',
            confirm: true,
            onClick: (item) => self.handleDelete(item)
          }
        ],
      },
    },
  ];
}
