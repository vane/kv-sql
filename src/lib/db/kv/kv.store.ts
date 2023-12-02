import {KVRow} from "./kv.model";
import {KvConstraints} from "./kv.constraints";

export class KvStore {
    private data: {[key: string]: KVRow} = {};

    constructor(private prefix: string) {
    }

    commit() {
        for(let key in this.data) {
            localStorage.setItem(key, JSON.stringify(this.data[key]));
        }
    }

    rollback() {
        this.data = {}
    }

    setRow(tableId: number, rowId: string, row: any) {
        const key = this.rowKey(tableId, rowId)
        this.data[key] = row;
    }

    getRow(tableId: number, rowId: string): KVRow|undefined {
        const key = this.rowKey(tableId, rowId)
        // try from cache
        if (this.data[key]) return this.data[key]

        // not found so find in storage
        const row = localStorage.getItem(key)
        if (!row) return undefined;

        this.data[key] = JSON.parse(row);
        return this.data[key];
    }

    hasRow(tableId: number, rowId): boolean {
        const key = this.rowKey(tableId, rowId);
        return !!localStorage.getItem(key)
    }

    private rowKey(tableId: number, rowId: string): string {
        return `${this.prefix}_${KvConstraints.TABLE}${tableId}_${KvConstraints.ROW}${rowId}`
    }
}