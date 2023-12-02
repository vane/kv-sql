import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const updateStmt = (q: any, kv: KvOp) => {
    switch (q.into.variant) {
        case 'table': {
            const rows = kv.select.table(q.into.name, [{variant: 'star'}], undefined, undefined, q.where)
            if (rows.length == 0) return 0
            return kv.update.rows(q, rows)
        }
        default: {
            Logger.warn('updateStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `updateStmt ${q.into.variant}`)
        }
    }
}