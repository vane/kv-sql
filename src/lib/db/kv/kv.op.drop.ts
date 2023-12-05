import {KvOp} from "./kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KVTableConsPk, KVTableDef} from "./kv.model";
import {KvOpSelect} from "./kv.op.select";

export class KvOpDrop {
    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvOpDrop.constructor', prefix);
    }

    column(q: any) {
        // alter table customers drop column Address
        const def = this.op.table.get(q.target.name);
        if (!def.cols[q.definition.name])
            throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `"${q.definition.name}" in table "${q.target.name}"`);
        const col = def.cols[q.definition.name]
        Logger.debug('KvOpDrop.column', def);
        this.alterColumns(def, col.id)
        this.alterData(def, def.cons.pk, col.id - 1);
    }

    private alterColumns(def: KVTableDef, index: number) {
        for (let key in def.cols) {
            const col = def.cols[key]
            if (col.id == index) {
                delete def.cols[col.name]
            } else if (col.id > index) {
                col.id -= 1
            }
        }
        def.idx.splice(index - 1, 1);
    }

    private alterData(def: KVTableDef, pk: KVTableConsPk, index: number) {
        if (!pk.first) return []
        let row = this.op.store.getRow(def.id, pk.first)
        while (row) {
            row.data.splice(index, 1)
            this.op.store.setRow(def.id, row.id, row)
            if (!row.next) break
            row = this.op.store.getRow(def.id, row.next)
        }
    }
}