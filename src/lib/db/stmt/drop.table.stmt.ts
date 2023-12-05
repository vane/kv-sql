import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const dropTableStmt = (q: any, kv: KvOp) => {
    switch (q.format) {
        case 'table':
            return kv.table.drop(q)
            break
        default: {
            Logger.warn('dropTableStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `dropTableStmt ${q.format}`)
        }
    }
}