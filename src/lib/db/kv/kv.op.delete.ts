import {Logger} from "../../logger";
import {KVResultRow} from "./kv.model";
import {KvOp} from "./kv.op";

export class KvOpDelete {
    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvOpDelete.constructor', prefix)
    }

    rows(q: any, rows: KVResultRow[]) {
        const def = this.op.table.get(q.from.name)
        let affected = 0
        for (let row of rows) {
            if(this.op.store.delRow(def.id, row._id)) affected += 1
        }
        return affected
    }
}