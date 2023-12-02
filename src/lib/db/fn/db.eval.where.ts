import {DBError, DBErrorType} from "../db.error";
import {dbEvalValue} from "./db.eval.value";
import {Logger} from "../../logger";
import {KvOp} from "../kv/kv.op";
import {KVResultRow, KVTableDef} from "../kv/kv.model";

export const dbEvalWhere = (where: any, rows: KVResultRow[], def: KVTableDef, op: KvOp): KVResultRow[] => {
    // select * from artists where ArtistId > 5 and ArtistId < 10;
    // select * from artists where artists.ArtistId in (select ArtistId from albums)
    const result: KVResultRow[] = []
    // cache for right side operations
    const rCache = {}
    for (let w of where) {
        switch (w.format) {
            case 'binary':
                for (let r of rows) {
                    if (evalOperation(w, r, def, op, rCache)) {
                        result.push(r)
                    }
                }
                break;
            default: {
                Logger.warn('dbEvalWhere', w);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `where ${w.format}`)
            }
        }
    }
    return result;
}

const evalOperation = (w: any, o: KVResultRow, def: KVTableDef, op: KvOp, cache: any): boolean => {
    switch (w.operation) {
        case '=': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return evalLeft(w.left, o, def) == cache[rstr]
        }
        case '<': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return evalLeft(w.left, o, def) < cache[rstr]
        }
        case '>': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return evalLeft(w.left, o, def) > cache[rstr]
        }
        case '>=': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return evalLeft(w.left, o, def) >= cache[rstr]
        }
        case '<=': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return evalLeft(w.left, o, def) <= cache[rstr]
        }
        case 'and': {
            return evalOperation(w.left, o, def, op, cache) && evalOperation(w.right, o, def, op, cache)
        }
        case 'or': {
            return evalOperation(w.left, o, def, op, cache) || evalOperation(w.right, o, def, op, cache)
        }
        case 'in': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return cache[rstr].includes(evalLeft(w.left, o, def))
        }
        case 'not in': {
            const rstr = JSON.stringify(w.right);
            if (!cache[rstr]) cache[rstr] = evalRight(w.right, op)
            return !cache[rstr].includes(evalLeft(w.left, o, def))
        }
        default: {
            Logger.warn('evalOperation', w);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `operation (${w.operation})`)
        }
    }
}

const evalLeft = (left: any, o: KVResultRow, def: KVTableDef) => {
    const a = left.name.split('.')
    if (a.length == 2) return evalLeftWithTable(a, left, o, def);
    if (!(left.name in o)) {
        Logger.warn('evalLeft', left);
        throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `"${left.name}" in table "${def.name}"`)
    }
    return o[left.name];
}

const evalLeftWithTable = (a: string[], left: any, o: KVResultRow, def: KVTableDef) => {
    if (def.name != a[0]) {
        Logger.warn('evalLeft', left);
        throw new DBError(DBErrorType.TABLE_NOT_EXISTS, `"${left.name}" expected table "${def.name}"`)
    }
    if (!(a[1] in o)) {
        Logger.warn('evalLeft', left);
        throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `"${a[1]}" in table "${def.name}"`)
    }
    return o[a[1]]
}

const evalRight = (right: any, op: KvOp) => {
    switch (right.type) {
        case 'literal':
            return dbEvalValue(right.value, right.variant)
        case 'expression': {
            const values = []
            for (const e of right.expression) {
                values.push(dbEvalValue(e.value, e.variant))
            }
            return values;
        }
        case 'statement':
            const values = []
            const res = op.execute(right)
            const colName = right.result[0].name;
            for (const r of res) {
                values.push(r[colName])
            }
            return values
        default: {
            Logger.warn('evalRight', right);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `right value (${right.type})`)
        }
    }
}