import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KVResultRow, KVTableConsPk, KVTableDef} from "./kv.model";
import {dbEvalValue} from "../fn/db.eval.value";
import {dbEvalWhere} from "../fn/db.eval.where";
import {KvStore} from "./kv.store";

export class KvOpSelect {
    constructor(private prefix: string, private tb: KVTable, private store: KvStore) {
        Logger.debug('KvOpSelect.constructor', prefix)
    }

    table(tname: string, columns: any[], limit?: any, order?: any[], where?: any): KVResultRow[] {
        const def: KVTableDef = this.tb.get(tname)
        const pk = def.cons.pk
        Logger.debug('KvOpSelect.table', def.cols, columns, 'margin', limit, 'where', where)
        let tlimit = -1
        let offset = 0
        if (limit?.start) tlimit = parseInt(limit.start.value)
        if (limit?.offset) offset = Math.max(parseInt(limit.offset.value), 0)
        let all = false
        let cols = []
        for (let col of columns) {
            switch (col.variant) {
                case 'star':
                    all = true
                    break
                case 'column':
                    if (def.idx.indexOf(col.name) == -1) {
                        const msg = `column "${col.name}" in table "${def.name}"`;
                        throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, msg);
                    }
                    cols.push(col.name);
                    break
                default: {
                    Logger.warn('KvOpSelect.table', tname, col);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${col.variant}`)
                }
            }
        }
        let result = this.selectAll(def, pk, cols, where);
        if (result.length === 0) return result;
        if (order) result = this.orderBy(result, order);
        if (tlimit > 0 && offset) {
            if (result.length < offset) return [];
            return result.slice(offset, Math.min(offset+tlimit, result.length))
        }
        if (tlimit > 0) return result.slice(0, Math.min(tlimit, result.length))
        return result
    }

    private orderBy(result: KVResultRow[], order: any[]): KVResultRow[] {
        for (let ord of order) {
            if (!(ord.expression.name in result[0])) {
                throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `order by ${ord.expression.name}`)
            }
            switch (ord.expression.variant) {
                case 'column': {
                    if(ord.direction === 'asc') break
                    result.sort((a, b) => {
                        if (a[ord.expression.name] > b[ord.expression.name]) return -1
                        if (a[ord.expression.name] < b[ord.expression.name]) return 1
                        return 0;
                    })
                    break;
                }
                default: {
                    Logger.warn('KvOpSelect.table.order', ord);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${ord.expression.variant}`)
                }
            }
        }
        return result
    }

    private selectAll(def: KVTableDef, pk: KVTableConsPk, cols: string[], where?: any): KVResultRow[] {
        if (!pk.first) return []
        let rows = []
        let row = this.store.getRow(def.id, pk.first)
        while (row) {
            // map rows to cols
            const o = {_id: row.id}
            row.data.forEach((val, i) => {
                o[def.idx[i]] = dbEvalValue(val, def.cols[def.idx[i]].type)
                return o
            })
            if (where) {
                if (dbEvalWhere(where, o)) rows.push(this.filterCols(o, cols))
            } else{
                rows.push(this.filterCols(o, cols))
            }
            if (!row.next) break

            row = this.store.getRow(def.id, row.next)
        }
        return rows
    }

    private filterCols(o: KVResultRow, cols: string[]) {
        if (cols.length == 0) return o
        const out = {_id: o._id}
        for (const col of cols) {
            out[col] = o[col]
        }
        return out
    }
}