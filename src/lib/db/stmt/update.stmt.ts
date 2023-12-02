import {KVStore} from "../kv/kv.store";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const updateStmt = (q: any, kv: KVStore) => {
    // update artists set Name = 'foo' where ArtistId = 1
    switch (q.into.variant) {
        case 'table': {
            Logger.debug('updateStmt', q)
            break
        }
        default: {
            Logger.warn('updateStmt', q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `updateStmt ${q.into.variant}`)
        }
    }
    return
}