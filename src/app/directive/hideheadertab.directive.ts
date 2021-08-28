import { AfterViewInit, Directive, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';
@Directive({
    selector: '[appHideHeader]'
})
export class HideHeaderTabDirective implements OnInit, AfterViewInit {
    @Input('header') header: any;
    private tab: any;
    private bar: any;
    private lastY = 0;
    private hide: boolean = false;
    private chat;
    private send;
    constructor(private renderer: Renderer2, private domCtrl: DomController) { }
    ngOnInit() { }
    ngAfterViewInit() {
        this.header = this.header.el;
        this.tab = document.getElementById('tabBar');
        if (this.tab) {
            this.bar = this.tab.children[1];
        } else {
            this.tab = document.getElementById('footer');
            this.bar = this.tab;
        }
        this.domCtrl.write(() => {
            this.renderer.setStyle(this.header, 'transition', 'margin-top 500ms');
            this.renderer.setStyle(this.tab, 'transition', 'height 500ms');
        });
    }
    @HostListener('ionScroll', ['$event']) onContentScroll($event: any) {
        const scrollH = $event.currentTarget.scrollHeight;
        const headerH = this.header.clientHeight;
        const tabH = this.tab.clientHeight;
        const barH = this.bar.clientHeight;
        const sendH = this.send ? this.send.clientHeight : 0;    //console.log('headerH:', headerH, ' scrollH:', scrollH, ' barH:', barH, ' tabH:', tabH, 'sum', headerH + scrollH + barH);

        //if (this.lastH === scrollH ) {//taransition中にstyleを変えるとthenとelseを交互に呼び出し発振するのを防ぐ
        if (this.hide === false && $event.detail.scrollTop > this.lastY && tabH === scrollH + barH) {
            this.domCtrl.write(() => {
                this.renderer.setStyle(this.header, 'margin-top', `-${headerH}px`);
                this.renderer.setStyle(this.tab, 'height', `${tabH + barH}px`);
            });
            this.hide = true; console.log(`下向き tabH:`, tabH, " sendH:", sendH, "scrollH:", scrollH);

        } else if (this.hide === true && $event.detail.scrollTop < this.lastY && tabH === scrollH) {
            this.domCtrl.write(() => {
                this.renderer.setStyle(this.header, 'margin-top', '0');
                this.renderer.setStyle(this.tab, 'height', `${scrollH - barH}px`);
            });
            setTimeout(() => { this.hide = false; }, 600); console.log(`上向き tabH:`, tabH, " sendH", sendH, "scrollH:", scrollH);
        }
        //}
        this.lastY = $event.detail.scrollTop;
        //this.lastH = scrollH;// console.log(`高さ${$event.currentTarget.scrollHeight}`);
    }
}