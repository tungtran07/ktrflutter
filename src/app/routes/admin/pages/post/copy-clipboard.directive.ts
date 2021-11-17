import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[copy-clipboard]' })
export class CopyClipboardDirective {

    @Input('copy-clipboard')
    public payload: string;

    @Input('context')
    public context: string;

    @Output('copied')
    public copied: EventEmitter<string> = new EventEmitter<string>();

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent): void {
        event.preventDefault();
        if (!this.payload) {
            return;
        }

        const listener = (e: ClipboardEvent) => {
            const clipboard = e.clipboardData || window['clipboardData'];
            clipboard.setData('text', this.payload.toString());
            e.preventDefault();
            this.message.success('Đã sao chép vào bộ nhớ tạm!');
            this.copied.emit(this.payload);
        };

        document.addEventListener('copy', listener, false);
        document.execCommand('copy');
        document.removeEventListener('copy', listener, false);
    }

    constructor(
        private message: NzMessageService,
    ) {}
}
