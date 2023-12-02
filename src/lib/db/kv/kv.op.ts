import {KvOpDelete} from "./kv.op.delete";
import {KvOpInsert} from "./kv.op.insert";
import {KvOpSelect} from "./kv.op.select";
import {KvOpUpdate} from "./kv.op.update";
import {KvStore} from "./kv.store";
import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {createTableStmt} from "../stmt/create.table.stmt";
import {insertStmt} from "../stmt/insert.stmt";
import {selectStmt} from "../stmt/select.stmt";
import {updateStmt} from "../stmt/update.stmt";
import {deleteStmt} from "../stmt/delete.stmt";


export class KvOp {
    readonly store: KvStore;
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
        this.select = new KvOpSelect(prefix, this);
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

    execute(q: any): any {
        switch (q.variant.toLowerCase()) {
            case 'transaction': {
                Logger.warn('SQLConnection.executeStmt "transaction" not implemented', q);
                break;
            }
            case 'create': {
                if (q.format.toLowerCase() === 'table') return createTableStmt(q, this);
                Logger.warn(`Unsupported create format ${q.format}`, q)
                break;
            }
            case 'insert': {
                return insertStmt(q, this);
            }
            case 'select': {
                return selectStmt(q, this);
            }
            case 'update': {
                return updateStmt(q, this);
            }
            case 'delete': {
                return deleteStmt(q, this);
            }
            default: {
                Logger.warn(`Unsupported statement type ${q.variant}`, q)
            }
        }
        return undefined;
    }
}