import {Logger} from "../../logger";
import {KVTable} from "./kv.table";
import {DBError, DBErrorType} from "../db.error";
import {
    DatatypeVariant,
    InsertResult,
    InsertResultExpression,
    InsertResultType
} from "../../parser/sql.parser.model";
import {KVRow, KVTableCol, KVTableConsPk, KVTableDef} from "./kv.model";
import {KvConstraints} from "./kv.constraints";

export class KvOpInsert {
    private store: {[key: string]: KVRow} = {};
    constructor(private prefix: string, private tb: KVTable) {
        Logger.debug('KvOpInsert', prefix);
    }

    table(tname: string, results: InsertResult[]) {
        if (!this.tb.has(tname)) throw new DBError(DBErrorType.TABLE_NOT_EXISTS, tname);
        const def = this.tb.td.defs[tname];
        // pk
        const pk = def.cons.pk;
        let pkCol = []
        if (pk.cname) pkCol = pk.cname.concat();
        for (const result of results) {
            switch (result.type) {
                case InsertResultType.expression:
                    if (def.colid !== result.expression.length) {
                        Logger.warn('KVOp.insertTable', result.expression.length, this.tb.td.defs[tname].id);
                        throw new DBError(DBErrorType.INSERT_ROW_SIZE, `${result.expression.length} != ${def.colid}`);
                    }
                    const row = [];
                    let rowId = '';
                    for (let key: string in def.cols) {
                        const col = def.cols[key];
                        const res = result.expression[col.id - 1];
                        this.evaluateValue(def, def.cols[key], res);
                        // pk
                        if (pkCol.includes(key)) rowId = this.evaluatePk(pkCol, key, res.value, rowId);
                        row.push(res.value);
                    }
                    if (!rowId) {
                        Logger.warn('KVOp.insertTable', 'row', row, 'insert', result, 'def', def)
                        throw new DBError(DBErrorType.INSERT_MISSING_PK, `${pkCol.join(',')}`)
                    }
                    this.updateNext(def, pk, rowId);
                    this.insertRow(def, rowId, row, pk);
                    break;
                default:
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, result.type);
            }
        }
    }

    private evaluatePk(pkCol: string[], key: string, value: string, rowId: string) {
        if (pkCol.length > 1) {
            pkCol.splice(pkCol.indexOf(key), 1);
            return rowId + value + '_';
        }
        return rowId + value;
    }

    private evaluateValue(def: KVTableDef, col: KVTableCol, res: InsertResultExpression) {
        // TODO validate constraints in KVTableDef
        switch (res.variant) {
            case DatatypeVariant.decimal: {
                if (col.type === DatatypeVariant.integer) return true;
                if (col.type === DatatypeVariant.numeric) return true;
            }
            case DatatypeVariant.text: {
                if (col.type === DatatypeVariant.nvarchar) return true;
                // TODO validate datetime value
                if (col.type === DatatypeVariant.datetime) return true;
            }
            case DatatypeVariant.null: {
                if (!col.notNull) return true;
            }
            default: {
                Logger.warn('KVOp.evaluateValue', col, res);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `got ${res.variant} expected ${col.type}`);
            }
        }
    }

    private insertRow(def: KVTableDef, rowId: string, data: string[], pk: KVTableConsPk): KVRow {
        const key = `${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${rowId}`
        const row = {data, id: rowId}
        this.store[key] = row
        // current id
        pk.id = rowId;
        if (!pk.first) pk.first = rowId;
        return row
    }

    private updateNext(def: KVTableDef, pk: KVTableConsPk, next: string) {
        if (!pk.id) return;
        const key = `${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${pk.id}`
        const row = this.store[key]
        row.next = next
        this.store[key] = row
    }

    commit() {
        for(let key in this.store) {
            localStorage.setItem(key, JSON.stringify(this.store[key]));
        }
    }

    rollback() {
        this.store = {};
    }

    dump() {
        return this.store;
    }
}