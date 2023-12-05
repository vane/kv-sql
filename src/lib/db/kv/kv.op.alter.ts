import {KvOp} from "./kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KVTableCol, KVTableConsPk, KVTableDef} from "./kv.model";

export class KvOpAlter {
    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvOpDrop.constructor', prefix);
    }

    dropColumn(q: any) {
        // alter table customers drop column Address
        const def = this.op.table.get(q.target.name);
        if (!def.cols[q.definition.name])
            throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `"${q.definition.name}" in table "${q.target.name}"`);
        const col = def.cols[q.definition.name]
        Logger.debug('KvOpDrop.column', def);
        this.alterDropColumns(def, col.id)
        this.alterDropData(def, def.cons.pk, col.id - 1);
    }

    addColumn(def: KVTableDef, col: KVTableCol) {
        if (col.notNull && col.defaultValue === undefined) {
            const msg = `Add not null value to table "${def.name}" column "${col.name}" without defaultValue not implemented`
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, msg);
        }
        def.idx.push(col.name);
        def.cols[col.name] = col;
        this.alterAddData(def, def.cons.pk, col.defaultValue || '');
    }

    private alterDropColumns(def: KVTableDef, index: number) {
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

    private alterDropData(def: KVTableDef, pk: KVTableConsPk, index: number) {
        if (!pk.first) return []
        let row = this.op.store.getRow(def.id, pk.first)
        while (row) {
            row.data.splice(index, 1)
            this.op.store.setRow(def.id, row.id, row)
            if (!row.next) break
            row = this.op.store.getRow(def.id, row.next)
        }
    }

    private alterAddData(def: KVTableDef, pk: KVTableConsPk, defaultValue: string) {
        if (!pk.first) return []
        let row = this.op.store.getRow(def.id, pk.first)
        while (row) {
            row.data.push(defaultValue)
            this.op.store.setRow(def.id, row.id, row)
            if (!row.next) break
            row = this.op.store.getRow(def.id, row.next)
        }
    }
}