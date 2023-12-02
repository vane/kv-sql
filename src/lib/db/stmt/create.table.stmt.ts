import {DBError, DBErrorType} from "../db.error";
import {KvOp} from "../kv/kv.op";

export const createTableStmt = (q: any, kv: KvOp) => {
    const tableName = q.name.name;
    let existsOk = false;
    // primitive check if not exists
    if (q.condition && q.condition[0] &&
        q.condition[0].variant.toLowerCase() === 'if' &&
        q.condition[0].condition.operator.toLowerCase() === 'not exists') existsOk = true;

    if (kv.table.has(tableName)) {
        if (!existsOk) throw new DBError(DBErrorType.TABLE_EXISTS, tableName);
        return;
    }
    kv.table.add(tableName, q.definition);
}
