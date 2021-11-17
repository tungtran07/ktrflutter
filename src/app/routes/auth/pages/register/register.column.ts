import {DatatableModel} from '@components/datatable/datatable.model';

import {finalize} from 'rxjs/operators';

export function columns(self): DatatableModel[] {
  return [
    {
      name: 'userName',
      title: 'Tên đăng nhập',
      formItem: {
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'password',
      title: self.langPrefix + '.password',
      formItem: {
        type: 'password',
        confirm: true,
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'name',
      title: 'Họ và tên',
      formItem: {
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'phoneNumber',
      title: 'Số điện thoại',
      formItem: {
        rules: [
          {
            type: 'required',
          },
        ]
      }
    },
    {
      name: 'email',
      title: 'Email',
      formItem: {
        rules: [
          { type: 'required' },
          { type: 'email' },
        ]
      }
    },
    {
      name: 'province',
      title: 'routes.Admin.Order.customerProvince',
      formItem: {
        type: 'select',
        list: self.listProvince,
        rules: [ { type: 'required' } ],
        autoSet: (value, validation) => {
          if (validation.controls.district.value) {
            validation.controls.district.setValue(null);
          }
          if (validation.controls.ward.value) {
            validation.controls.ward.setValue(null);
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
                res.data.map(item => self.listDistrict.push({value: item.districtCode, label: item.districtName}));
              });
          }
        }
      }
    },
    {
      name: 'district',
      title: 'routes.Admin.Order.customerDistrict',
      formItem: {
        type: 'select',
        list: self.listDistrict,
        rules: [ { type: 'required' } ],
        autoSet: (value, validation) => {
          if (validation.controls.ward.value) {
            validation.controls.ward.setValue(null);
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
      name: 'ward',
      title: 'routes.Admin.Order.customerCommune',
      formItem: {
        type: 'select',
        list: self.listCommune,
        rules: [ { type: 'required' } ],
      }
    },
    {
      name: 'apartmentNumber',
      title: 'routes.Admin.Order.customerApartmentNumber',
      formItem: {}
    },
    {
      name: 'registerCode',
      title: 'Mã đăng ký',
      formItem: {}
    }
  ];
}
