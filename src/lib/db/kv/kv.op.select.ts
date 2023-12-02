import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KVRow, KVTableConsPk, KVTableDef} from "./kv.model";
import {KvConstraints} from "./kv.constraints";

export class KvOpSelect {
    constructor(private prefix: string, private tb: KVTable) {
        Logger.debug('KvOpSelect', prefix)
    }

    table(tname: string, result: any[], margin?: any) {
        if (!this.tb.has(tname)) throw new DBError(DBErrorType.TABLE_NOT_EXISTS, tname);
        const def = this.tb.td.defs[tname];
        const pk = def.cons.pk
        Logger.debug('KvOpSelect.table', def, result, 'margin', margin)
        let limit = -1
        let offset = 0
        if (margin.start) limit = parseInt(margin.start.value)
        if (margin.offset) offset = Math.max(parseInt(margin.offset.value), 0)
        let all = false
        for (let res of result) {
            switch (res.variant) {
                case 'star':
                    all = true
                    break
                case 'column':
                    break
                default: {
                    Logger.warn('KvOpSelect.table', tname, res);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${res}`)
                }
            }
        }
        return this.selectAll(def, pk, limit, offset)
    }

    private selectAll(def: KVTableDef, pk: KVTableConsPk, limit: number, offset: number): string[][] {
        let rows = []
        let row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${pk.first}`)
        while (row && (limit < 0 || rows.length < limit)) {
            // todo fix performance
            if (offset > 0) {
                offset--;
                row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${row.next}`)
                continue;
            }
            rows.push(row.data)
            if (!row.next) break
            row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${row.next}`)
        }
        Logger.debug('KvOpSelect.selectAll row', rows, rows.length, offset)
        return rows
    }

    private getRow(key: string): KVRow|undefined {
        const row = localStorage.getItem(key)
        if (!row) return undefined;
        return JSON.parse(row);
    }
}