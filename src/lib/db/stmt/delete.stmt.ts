import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";
import {KvOpSelect} from "../kv/kv.op.select";

export const deleteStmt = (q: any, kv: KvOp) => {
    switch (q.from.variant) {
        case 'table': {
            const rows = kv.select.table(q.from.name, KvOpSelect.STAR, undefined, undefined, q.where)
            if (rows.length == 0) return 0
            return kv.delete.rows(q, rows);
        }
        default: {
            Logger.warn('deleteStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `deleteStmt ${q.from.variant}`)
        }
    }
}