import {KVTable} from "./kv.table";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KVRow, KVTableCol, KVTableConsPk, KVTableDef} from "./kv.model";
import {KvConstraints} from "./kv.constraints";
import {DatatypeVariant} from "../../parser/sql.parser.model";

export class KvOpSelect {
    constructor(private prefix: string, private tb: KVTable) {
        Logger.debug('KvOpSelect', prefix)
    }

    table(tname: string, columns: any[], margin?: any, order?: any[]) {
        if (!this.tb.has(tname)) throw new DBError(DBErrorType.TABLE_NOT_EXISTS, tname);
        const def: KVTableDef = this.tb.td.defs[tname];
        const pk = def.cons.pk
        Logger.debug('KvOpSelect.table', def.cols, columns, 'margin', margin)
        let limit = -1
        let offset = 0
        if (margin?.start) limit = parseInt(margin.start.value)
        if (margin?.offset) offset = Math.max(parseInt(margin.offset.value), 0)
        let all = false
        for (let col of columns) {
            switch (col.variant) {
                case 'star':
                    all = true
                    break
                case 'column':
                    break
                default: {
                    Logger.warn('KvOpSelect.table', tname, col);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${col.variant}`)
                }
            }
        }
        const result = this.selectAll(def, pk, limit, offset);
        if (!order) return result;
        if (result.length === 0) return result;
        return this.orderBy(result, order);
    }

    private orderBy(result: {[key:string]: any}, order: any[]) {
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

    private selectAll(def: KVTableDef, pk: KVTableConsPk, limit: number, offset: number): {[key:string]: any}[] {
        let rows = []
        let row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${pk.first}`)
        while (row && (limit < 0 || rows.length < limit)) {
            // todo fix performance
            if (offset > 0) {
                offset--;
                row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${row.next}`)
                continue;
            }
            // map rows to cols
            const o = {}
            row.data.forEach((val, i) => {
                o[def.idx[i]] = this.evalValue(val, def.cols[def.idx[i]])
                return o
            })
            rows.push(o)
            if (!row.next) break
            row = this.getRow(`${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${row.next}`)
        }
        Logger.debug('KvOpSelect.selectAll row', rows, rows.length, offset)
        return rows
    }

    private evalValue(val: string, col: KVTableCol) {
        switch (col.type) {
            case DatatypeVariant.integer:
                return parseInt(val)
            case DatatypeVariant.numeric:
                return parseFloat(val)
        }
        return val
    }

    private getRow(key: string): KVRow|undefined {
        const row = localStorage.getItem(key)
        if (!row) return undefined;
        return JSON.parse(row);
    }
}