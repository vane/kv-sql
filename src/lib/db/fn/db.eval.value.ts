import {SqlDatatype} from "../../parser/sql.parser.model";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const dbEvalValue = (val: string, type: SqlDatatype) => {
    switch (type.toLowerCase()) {
        case SqlDatatype.integer:
            return parseInt(val)
        case SqlDatatype.numeric:
        case SqlDatatype.decimal:
            return parseFloat(val)
        case SqlDatatype.datetime:
        case SqlDatatype.nvarchar:
            break
        default: {
            Logger.warn('dbEvalValue', type, val);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `eval value (${type})`)
        }
    }
    return val
}