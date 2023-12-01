import {Logger} from "../../logger";
import {KvConstraints} from "./kv.constraints";

export class KVTable {
    private readonly td: any;

    constructor(private prefix: string) {
        const tdPrefix = `${this.prefix}_${KvConstraints.TABLE_DEFINITION}`
        const td = localStorage.getItem(tdPrefix)
        if (!td) {
            localStorage.setItem(tdPrefix, JSON.stringify({}));
            this.td = {};
        } else {
            this.td = td;
        }
        Logger.debug('KVTable', prefix, 'td', this.td);
    }

    has = (name: string): boolean => {
        Logger.debug(name in this.td);
        return this.td.has(name)
    }

    add(name: string, cols: string) {

    }
}