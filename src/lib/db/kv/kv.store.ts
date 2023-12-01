import {KVTable} from "./kv.table";


export class KVStore {
    readonly table: KVTable
    constructor(private prefix: string) {
        this.table = new KVTable(prefix);
    }
}