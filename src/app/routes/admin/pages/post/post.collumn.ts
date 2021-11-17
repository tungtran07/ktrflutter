import { DatatableModel } from '@components/datatable/datatable.model';

export function categoryColumn(self): DatatableModel[] {
    return [
        {
            name: 'title',
            title: 'Tên chuyên mục',
            formItem: {
                rules: [
                    {
                        type: 'required'
                    }
                ]
            }
        },
        {
            name: 'summary',
            title: 'Giới thiệu',
            formItem: {
                type: 'textarea'
            }
        }
    ];
}
