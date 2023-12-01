import {KVTable} from "./kv.table";
import {KVOp} from "./kv.op";


export class KVStore {
    readonly table: KVTable;
    readonly op: KVOp;
    constructor(private prefix: string) {
        this.table = new KVTable(prefix);
        this.op = new KVOp(prefix, this.table);
    }

    commit() {
        this.table.commit();
    }

    rollback() {
        this.table.rollback();
    }
}