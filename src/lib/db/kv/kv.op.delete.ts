import {KVTable} from "./kv.table";
import {KvStore} from "./kv.store";
import {Logger} from "../../logger";
import {KVResultRow} from "./kv.model";

export class KvOpDelete {
    constructor(private prefix: string, private tb: KVTable, private store: KvStore) {
        Logger.debug('KvOpDelete.constructor', prefix)
    }

    rows(q: any, rows: KVResultRow[]) {
        const def = this.tb.get(q.from.name)
        let affected = 0
        for (let row of rows) {
            if(this.store.delRow(def.id, row._id)) affected += 1
        }
        return affected
    }
}