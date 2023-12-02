import {KVTable} from "./kv.table";
import {KvOpInsert} from "./kv.op.insert";
import {KvOpSelect} from "./kv.op.select";
import {Logger} from "../../logger";
import {KvOpUpdate} from "./kv.op.update";
import {KvStore} from "./kv.store";


export class KvOp {
    private store: KvStore;

    readonly table: KVTable;
    readonly insert: KvOpInsert;
    readonly select: KvOpSelect;
    readonly update: KvOpUpdate;

    constructor(private prefix: string) {
        this.store = new KvStore(prefix);
        this.table = new KVTable(prefix);
        this.insert = new KvOpInsert(prefix, this.table, this.store);
        this.select = new KvOpSelect(prefix, this.table, this.store);
        this.update = new KvOpUpdate(prefix, this.table, this.store);
    }

    begin() {
        Logger.debug('begin')
    }

    commit() {
        this.table.commit();
        this.store.commit()
    }

    rollback() {
        this.table.rollback();
        this.store.rollback();
    }
}