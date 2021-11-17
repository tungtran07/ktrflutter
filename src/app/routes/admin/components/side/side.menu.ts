export const ListMenu = [
  {
    name: 'Manage',
    open: true,
    child: [
      // {
      //   icon: 'las la-lg gn-mr-10 la-clipboard-list',
      //   name: 'Order',
      //   path: ['/admin/order'],
      //   level: 0,
      // },
      {
        icon: 'las la-lg gn-mr-10 la-box',
        name: 'Product',
        path: ['/admin/product'],
        level: 0,
      },

      {
        icon: 'las la-lg gn-mr-10 la-qrcode',
        name: 'Post',
        path: ['/admin/post'],
        level: 10,
      }
    ]
  },
];
