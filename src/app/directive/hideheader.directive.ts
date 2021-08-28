import { AfterViewInit, Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';
@Directive({
    selector: '[appHideHeader]'
})
export class HideHeaderDirective implements OnInit, AfterViewInit {
    @Input('header') header: any;
    @Input('content') content: any;
    private lastY = 0;
    private hide: boolean = false;
    constructor(private renderer: Renderer2, private domCtrl: DomController) { }
    ngOnInit() { }
    ngAfterViewInit() {
        this.header = this.header.el;
        this.domCtrl.write(() => {
            this.renderer.setStyle(this.header, 'transition', 'margin-top 500ms');
        });
    }
    @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
        const scrollH = $event.currentTarget.scrollHeight;
        const headerH = this.header.clientHeight;        //if (this.lastH === scrollH ) {//taransition中にstyleを変えるとthenとelseを交互に呼び出し発振するのを防ぐ
        if (this.hide === false && $event.detail.scrollTop > this.lastY) {
            this.domCtrl.write(() => {
                this.renderer.setStyle(this.header, 'margin-top', `-${headerH}px`);
            });
            this.hide = true; //console.log(`下向き scrollH:`, scrollH);

        } else if (this.hide === true && $event.detail.scrollTop < this.lastY) {
            this.domCtrl.write(() => {
                this.renderer.setStyle(this.header, 'margin-top', '0');
            });
            setTimeout(() => { this.hide = false; }, 600); //console.log(`上向き scrollH:`, scrollH);
        }
        //}
        this.lastY = $event.detail.scrollTop;
        //this.lastH = scrollH;// console.log(`高さ${$event.currentTarget.scrollHeight}`);
    }
}