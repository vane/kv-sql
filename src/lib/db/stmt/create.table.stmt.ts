import {DBError, DBErrorType} from "../db.error";
import {KVStore} from "../kv/kv.store";

export const createTableStmt = (q: any, kv: KVStore) => {
    const tableName = q.name.name;
    let existsOk = false;
    // primitive check if not exists
    if (q.condition && q.condition[0] &&
        q.condition[0].variant === 'if' &&
        q.condition[0].condition.operator === 'not exists') existsOk = true;

    if (kv.table.has(tableName)) {
        if (!existsOk) throw new DBError(DBErrorType.TABLE_EXISTS, tableName);
        return;
    }
    kv.table.add(tableName, q.definition);
}
