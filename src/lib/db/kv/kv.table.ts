import {Logger} from "../../logger";
import {KvConstraints} from "./kv.constraints";

export class KVTable {
    private td: any;
    private readonly tdPrefix: string;

    constructor(private prefix: string) {
        this.tdPrefix = `${this.prefix}_${KvConstraints.TABLE_DEFINITION}`
        this.td = this.loadTd();
        Logger.debug('KVTable', prefix, 'td', this.td);
    }

    has = (name: string): boolean => {
        return !!this.td[name]
    }

    add(name: string, cols: any[]) {
        Logger.debug('KVTable.add', name, cols);
        ++this.td.tdId;
        this.td[name] = {
            cols,
            tdId: this.td.tdId,
            rowId: 0
        };
    }

    commit() {
        localStorage.setItem(this.tdPrefix, this.td);
    }

    rollback() {
        this.td = this.loadTd();
    }

    dump() {
        return this.td;
    }

    private loadTd() {
        const td = localStorage.getItem(this.tdPrefix)
        // initial value
        if (!td) return {tdId: 0};
        return td;
    }
}