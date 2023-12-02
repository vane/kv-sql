export class Benchmark {
    private static kv: {[key: string]: number} = {}
    private static el?: HTMLElement

    static setElement(el: HTMLElement) {
        this.el = el;
    }
    static start(key: string) {
        this.kv[key] = Date.now();
    }

    static stop(key: string, info = '') {
        const dt = Date.now()-this.kv[key];
        if (this.el) this.el.innerText = `${key} ${info} in ${dt}\n` + this.el.innerText;
        delete this.kv[key];
    }
}