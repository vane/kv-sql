import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const createVisitor = (q: any, kv: KVStore) => {
    switch (q.keyword) {
        case 'table': {
            const t = q.table[0]
            Logger.debug(t);
            if (kv.table.has(t.table)) throw new DBError(DBErrorType.TABLE_EXISTS, t.table)
            break;
        }
        default:
            Logger.debug(`createVisitor not implemented keyword ${q.keyword}`, q, kv)
    }
}
