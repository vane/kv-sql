import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const alterTableStmt = (q: any, kv: KvOp) => {
    switch (q.action) {
        case 'drop': {
            if (q.target.variant == 'table' && q.name.variant == 'column') return kv.alter.dropColumn(q)
        }
        case 'add': {
            if (q.target.variant == 'table' && q.definition.variant === 'column') return kv.table.addColumn(q)
        }
        case 'rename': {
            if (q.variant == 'alter table') return kv.table.renameColumn(q)
        }
        default: {
            Logger.warn('alterTableStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `alterTableStmt ${q.action}`)
        }
    }
}