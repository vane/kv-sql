import {KVStore} from "../kv/kv.store";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const selectStmt = (q: any, kv: KVStore) => {
    switch (q.from.variant) {
        case 'table': {
            Logger.debug('selectStmt', q);
            return kv.select.table(q.from.name, q.result, q.limit, q.order, q.where);
        }
        default: {
            Logger.warn('selectStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${q.from.variant}`)
        }
    }
}