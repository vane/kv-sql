import {Logger} from "./logger";

export class Benchmark {
    private static kv: {[key: string]: number} = {}
    static start(key: string) {
        this.kv[key] = Date.now();
    }

    static stop(key: string, info = '') {
        Logger.debug(key, info, 'in', Date.now()-this.kv[key]);
        delete this.kv[key];
    }
}