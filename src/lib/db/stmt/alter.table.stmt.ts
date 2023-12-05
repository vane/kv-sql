import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const alterTableStmt = (q: any, kv: KvOp) => {
    switch (q.action) {
        case 'drop': {
            if (q.target.variant == 'table' && q.definition.variant == 'column') return kv.drop.column(q)
        }
        default: {
            Logger.warn('alterTableStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `alterTableStmt ${q.action}`)
        }
    }
}