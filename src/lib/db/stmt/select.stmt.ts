import {KvOp} from "../kv/kv.op";
import {Logger} from "../../logger";
import {DBError, DBErrorType} from "../db.error";

export const selectStmt = (q: any, kv: KvOp) => {
    switch (q.from.variant) {
        case 'table': {
            Logger.debug('selectStmt', q);
            return kv.select.table(q.from.name, q.result, q.limit, q.order, q.where);
        }
        case 'join': {
            //select * from artists inner join albums where albums.ArtistId = artists.ArtistId
            Logger.debug('TODO selectStmt.join', q)
        }
        default: {
            Logger.warn('selectStmt', q.from.variant, q);
            throw new DBError(DBErrorType.NOT_IMPLEMENTED, `selectStmt ${q.from.variant}`)
        }
    }
}