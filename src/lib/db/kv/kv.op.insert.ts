import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {InsertResult, InsertResultExpression, InsertResultType, SqlDatatype} from "../../parser/sql.parser.model";
import {KVRow, KVTableCol, KVTableConsPk, KVTableDef} from "./kv.model";
import {KvOp} from "./kv.op";

export class KvOpInsert {
    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvOpInsert.constructor', prefix);
    }

    table(tname: string, results: InsertResult[]) {
        const def = this.op.table.get(tname);
        // pk
        const pk = def.cons.pk;
        let pkCol = []
        if (pk.cname) pkCol = pk.cname.concat();
        for (const result of results) {
            switch (result.type) {
                case InsertResultType.expression:
                    if (def.colid !== result.expression.length) {
                        Logger.warn('KVOp.insertTable', result.expression.length, def.id);
                        throw new DBError(DBErrorType.INSERT_ROW_SIZE, `${result.expression.length} != ${def.colid}`);
                    }
                    const row = [];
                    let rowId = '';
                    for (let key: string in def.cols) {
                        const col = def.cols[key];
                        const res = result.expression[col.id - 1];
                        this.validateColumnValue(def, def.cols[key], res);
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

    private validateColumnValue(def: KVTableDef, col: KVTableCol, res: InsertResultExpression) {
        // TODO validate constraints in KVTableDef
        switch (res.variant.toLowerCase()) {
            case SqlDatatype.decimal: {
                if (col.type.toLowerCase() === SqlDatatype.integer) return true;
                if (col.type.toLowerCase() === SqlDatatype.numeric) return true;
            }
            case SqlDatatype.text: {
                if (col.type.toLowerCase() === SqlDatatype.text) return true;
                if (col.type.toLowerCase() === SqlDatatype.nvarchar) return true;
                // TODO validate datetime value
                if (col.type.toLowerCase() === SqlDatatype.datetime) return true;
            }
            case SqlDatatype.nvarchar: {
                if (col.type.toLowerCase() === SqlDatatype.nvarchar) return true;
            }
            case SqlDatatype.integer: {
                if (col.type.toLowerCase() === SqlDatatype.integer) return true;
            }
            case SqlDatatype.null: {
                if (!col.notNull) return true;
            }
            default: {
                Logger.warn('KvOpInsert.evaluateValue', col, res);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `got ${res.variant} expected ${col.type}`);
            }
        }
    }

    private insertRow(def: KVTableDef, rowId: string, data: string[], pk: KVTableConsPk): KVRow {
        if (this.op.store.hasRow(def.id, rowId)) throw new DBError(DBErrorType.KEY_VIOLATION, `${rowId}`)
        const row: KVRow = {data, id: rowId, prev: pk.id}
        this.op.store.setRow(def.id, rowId, row);
        // current id
        pk.id = rowId;
        if (!pk.first) pk.first = rowId;
        return row
    }

    private updateNext(def: KVTableDef, pk: KVTableConsPk, next: string) {
        if (!pk.id) {
            Logger.warn('KvOpInsert.updateNext empty id', pk.id, def.name, next)
            return;
        }

        const row = this.op.store.getRow(def.id, pk.id)
        if (!row) {
            Logger.warn('KvOpInsert.updateNext empty row', pk, def, next)
            throw new DBError(DBErrorType.ROW_NOT_EXISTS, `table "${def.name}" id "${pk.id}" next "${next}"`)
        }
        row.next = next
        this.op.store.setRow(def.id, row.id, row)
    }
}