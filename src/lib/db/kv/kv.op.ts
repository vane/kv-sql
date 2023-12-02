import {KVTable} from "./kv.table";
import {KvOpInsert} from "./kv.op.insert";
import {KvOpSelect} from "./kv.op.select";
import {Logger} from "../../logger";
import {KvOpUpdate} from "./kv.op.update";
import {KvStore} from "./kv.store";
import {KvOpDelete} from "./kv.op.delete";


export class KvOp {
    private readonly store: KvStore;

    readonly table: KVTable;
    readonly insert: KvOpInsert;
    readonly select: KvOpSelect;
    readonly update: KvOpUpdate;
    readonly delete: KvOpDelete;

    constructor(private prefix: string) {
        Logger.debug('KvOp.constructor', prefix);
        this.table = new KVTable(prefix);
        this.store = new KvStore(prefix, this.table);
        this.insert = new KvOpInsert(prefix, this.table, this.store);
        this.select = new KvOpSelect(prefix, this.table, this.store);
        this.update = new KvOpUpdate(prefix, this.table, this.store);
        this.delete = new KvOpDelete(prefix, this.table, this.store);
    }

    begin() {
        Logger.debug('begin')
    }

    commit() {
        this.store.commit()
        this.table.commit();
    }

    rollback() {
        this.store.rollback();
        this.table.rollback();
    }
}