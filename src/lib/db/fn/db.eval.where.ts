import {DBError, DBErrorType} from "../db.error";
import {dbEvalValue} from "./db.eval.value";
import {Logger} from "../../logger";

export const dbEvalWhere = (where: any, o: {[key:string]: any}): boolean => {
    //select * from artists where ArtistId = 1;
    let result = true
    for (let w of where) {
        switch (w.format) {
            case 'binary':
                if (!(w.left.name in o)) throw new DBError(DBErrorType.COLUMN_NOT_EXISTS, `${w.left.name} ${JSON.stringify(o)}`)
                const right = dbEvalValue(w.right.value, w.right.variant)
                const left = o[w.left.name];
                result = evalOperation(w.operation, left, right) && result
                break;
            default: {
                Logger.warn('dbEvalWhere', w);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, `where ${w.format}`)
            }
        }
    }
    return result;
}

const evalOperation = (op: string, left: any, right: any): boolean => {
    switch (op) {
        case '=': {
            return left == right
        }
        default: {
            Logger.warn('evalOperation', left, op, right);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `operation (${op}) ${left} ${op} ${right}`)
        }
    }
}