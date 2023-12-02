import {DatatypeVariant} from "../../parser/sql.parser.model";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const dbEvalValue = (val: string, type: DatatypeVariant) => {
    switch (type) {
        case DatatypeVariant.integer:
            return parseInt(val)
        case DatatypeVariant.numeric:
        case DatatypeVariant.decimal:
            return parseFloat(val)
        case DatatypeVariant.datetime:
        case DatatypeVariant.nvarchar:
            break
        default: {
            Logger.warn('dbEvalValue', type, val);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `eval value (${type})`)
        }
    }
    return val
}