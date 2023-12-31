import {KvOpDelete} from "./kv.op.delete";
import {KvOpInsert} from "./kv.op.insert";
import {KvOpSelect} from "./kv.op.select";
import {KvOpUpdate} from "./kv.op.update";
import {KvOpAlter} from "./kv.op.alter";
import {KvSpecial} from "./kv.special";
import {KvStore} from "./kv.store";
import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {createTableStmt} from "../stmt/create.table.stmt";
import {insertStmt} from "../stmt/insert.stmt";
import {selectStmt} from "../stmt/select.stmt";
import {updateStmt} from "../stmt/update.stmt";
import {deleteStmt} from "../stmt/delete.stmt";
import {alterTableStmt} from "../stmt/alter.table.stmt";
import {dropTableStmt} from "../stmt/drop.table.stmt";


export class KvOp {
    readonly special: KvSpecial;
    readonly table: KVTable;
    readonly store: KvStore;
    readonly insert: KvOpInsert;
    readonly select: KvOpSelect;
    readonly update: KvOpUpdate;
    readonly delete: KvOpDelete;
    readonly alter: KvOpAlter;

    constructor(private prefix: string) {
        Logger.debug('KvOp.constructor', prefix);
        this.special = new KvSpecial(prefix, this);
        this.table = new KVTable(prefix, this);
        this.store = new KvStore(prefix, this);
        this.insert = new KvOpInsert(prefix, this);
        this.select = new KvOpSelect(prefix, this);
        this.update = new KvOpUpdate(prefix, this);
        this.delete = new KvOpDelete(prefix, this);
        this.alter = new KvOpAlter(prefix, this);
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
            case 'alter table':
                return alterTableStmt(q, this);
            case 'drop':
                return dropTableStmt(q, this);
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
                Logger.warn(`KvOp.execute unsupported statement type ${q.variant}`, q)
            }
        }
        return undefined;
    }
}