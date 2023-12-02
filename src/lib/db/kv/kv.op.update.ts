import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {KVResultRow, KVTableDef} from "./kv.model";
import {DBError, DBErrorType} from "../db.error";
import {ConstraintVariant} from "../../parser/sql.parser.model";
import {KvStore} from "./kv.store";

export class KvOpUpdate {
    constructor(private prefix: string, private tb: KVTable, private store: KvStore) {
        Logger.debug('KvOpUpdate.constructor', prefix)
    }

    rows(q: any, rows: KVResultRow[]) {
        const def = this.tb.get(q.into.name)
        for (const s of q.set) {
            switch (s.type) {
                case 'assignment': {
                    this.assignRows(def, s, rows)
                    break
                }
                default: {
                    Logger.warn('KvOpUpdate.rows.s', s);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, `update type ${s.type}`)
                }
            }
        }
        return rows.length
    }

    private assignRows(def: KVTableDef, s: any, rows: KVResultRow[]) {
        if (s.target.variant != ConstraintVariant.column) {
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `KvOpUpdate.assignRows target ${s.target.variant}`)
        }
        // check column exists and get index
        const idx = def.idx.indexOf(s.target.name)
        if (idx == -1) {
            const msg = `KvOpUpdate.assignRows table "${def.name}" column "${s.target.name}"`
            throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, msg)
        }

        for (let row of rows) {
            const r = this.store.getRow(def.id, row._id)
            if (!r) throw new DBError(DBErrorType.ROW_NOT_EXISTS, `KvOpUpdate.assignRows ${row._id}`)

            r.data[idx] = s.value.value;
            this.store.setRow(def.id, row._id, r)
        }
    }

}