import {KVTable} from "./kv.table";
import {KvOpInsert} from "./kv.op.insert";
import {KvOpSelect} from "./kv.op.select";
import {Logger} from "../../logger";
import {KvOpUpdate} from "./kv.op.update";


export class KVStore {
    readonly table: KVTable;
    readonly insert: KvOpInsert;
    readonly select: KvOpSelect;
    readonly update: KvOpUpdate;
    constructor(private prefix: string) {
        this.table = new KVTable(prefix);
        this.insert = new KvOpInsert(prefix, this.table);
        this.select = new KvOpSelect(prefix, this.table);
        this.update = new KvOpUpdate(prefix, this.table);
    }

    begin() {
        Logger.debug('begin')
    }

    commit() {
        this.table.commit();
        this.insert.commit();
        this.update.commit();
    }

    rollback() {
        this.table.rollback();
        this.insert.rollback();
        this.update.rollback();
    }
}