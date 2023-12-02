import {DBError, DBErrorType} from "../db.error";
import {dbEvalValue} from "./db.eval.value";
import {Logger} from "../../logger";

export const dbEvalWhere = (where: any, o: {[key:string]: any}): boolean => {
    // select * from artists where ArtistId > 5 and ArtistId < 10;
    let result = true
    for (let w of where) {
        switch (w.format) {
            case 'binary':
                result = evalOperation(w, o) && result
                break;
            default: {
                Logger.warn('dbEvalWhere', w);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `where ${w.format}`)
            }
        }
    }
    return result;
}

const evalOperation = (w: any, o: {[key:string]: any}): boolean => {
    switch (w.operation) {
        case '=': {
            return evalLeft(w.left, o) == evalRight(w.right)
        }
        case '<': {
            return evalLeft(w.left, o) < evalRight(w.right)
        }
        case '>': {
            return evalLeft(w.left, o) > evalRight(w.right)
        }
        case '>=': {
            return evalLeft(w.left, o) >= evalRight(w.right)
        }
        case '<=': {
            return evalLeft(w.left, o) <= evalRight(w.right)
        }
        case 'and': {
            return evalOperation(w.left, o) && evalOperation(w.right, o)
        }
        case 'or': {
            return evalOperation(w.left, o) || evalOperation(w.right, o)
        }
        case 'in': {
            return evalRight(w.right).includes(evalLeft(w.left, o))
        }
        default: {
            Logger.warn('evalOperation', w);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `operation (${w.operation})`)
        }
    }
}

const evalLeft = (left: any, o: {[key:string]: any}) => {
    if (!(left.name in o)) {
        Logger.warn('evalLeft', left);
        throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `${left.name} ${JSON.stringify(o)}`)
    }
    return o[left.name];
}

const evalRight = (right: any) => {
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
        default: {
            Logger.warn('evalRight', right);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `right value (${right.type})`)
        }
    }
}