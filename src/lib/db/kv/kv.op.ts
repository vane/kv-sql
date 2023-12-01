import {Logger} from "../../logger";
import {KVTable} from "./kv.table";
import {DBError, DBErrorType} from "../db.error";
import {
    DatatypeVariant,
    InsertExpressionVariant,
    InsertResult,
    InsertResultExpression,
    InsertResultType
} from "../../parser/sql.parser.model";
import {KVTableCol, KVTableDef} from "./kv.model";
import {KvConstraints} from "./kv.constraints";

export class KVOp {
    private store = {};
    private newData = {};
    constructor(private prefix: string, private table: KVTable) {
        Logger.debug('KVTable', prefix, 'td', this.table.td.defs);
    }

    insertTable(tname: string, results: InsertResult[]) {
        if (!this.table.has(tname)) throw new DBError(DBErrorType.TABLE_NOT_EXISTS, tname);
        const def = this.table.td.defs[tname];
        // pk
        const pk = def.cons.defs[def.cons.pk];
        let pkCol = []
        if (pk.pk && pk.cname) pkCol = pk.cname.concat();
        for (const result of results) {
            switch (result.type) {
                case InsertResultType.expression:
                    if (def.colid !== result.expression.length) {
                        Logger.warn('KVOp.insertTable', result.expression.length, this.table.td.defs[tname].id);
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
                    this.insertRow(def, rowId, row);
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
            case InsertExpressionVariant.decimal: {
                if (col.type === DatatypeVariant.integer) return true;
                if (col.type === DatatypeVariant.numeric) return true;
            }
            case InsertExpressionVariant.text: {
                if (col.type === DatatypeVariant.nvarchar) return true;
                // TODO validate datetime value
                if (col.type === DatatypeVariant.datetime) return true;
            }
            case InsertExpressionVariant.null: {
                if (!col.notNull) return true;
            }
            default: {
                Logger.warn('KVOp.evaluateValue', col, res);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `got ${res.variant} expected ${col.type}`);
            }
        }
    }

    private insertRow(def: KVTableDef, rowId: string, row: string[]) {
        const rkey = `${this.prefix}_${KvConstraints.TABLE}${def.id}_${KvConstraints.ROW}${rowId}`
        this.store[rkey] = row;
    }

    commit() {
        this.store = JSON.parse(JSON.stringify(this.newData));
    }

    rollback() {
        this.newData = JSON.parse(JSON.stringify(this.store));
    }

    dump() {
        return this.store;
    }
}