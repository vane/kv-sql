import {KVResultRow} from "../kv/kv.model";

export const dbColsFilter = (o: KVResultRow, cols: string[]) => {
    if (cols.length == 0) return o
    const out = {_id: o._id}
    for (const col of cols) {
        out[col] = o[col]
    }
    return out
}