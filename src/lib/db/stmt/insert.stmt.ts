import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const insertStmt = (q, kv: KvOp) => {
    switch (q.into.variant) {
        case 'table': {
            kv.insert.table(q.into.name, q.result);
            break
        }
        default: {
            Logger.warn('insertStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `insertStmt ${q.into.variant}`)
        }
    }
}