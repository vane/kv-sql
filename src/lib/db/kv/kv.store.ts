import {KVRow} from "./kv.model";
import {KvConstraints} from "./kv.constraints";
import {Logger} from "../../logger";
import {KvOp} from "./kv.op";

interface KVDelete {
    tableId: number;
    rowId: string;
}

export class KvStore {
    private data: {[key: string]: KVRow} = {};
    private deleted = new Set<KVDelete>()

    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvStore.constructor', prefix);
    }

    commit() {
        for(let key in this.data) {
            localStorage.setItem(key, JSON.stringify(this.data[key]));
        }
        this.commitDeleted();
    }

    rollback() {
        this.data = {}
    }

    setRow(tableId: number, rowId: string, row: KVRow) {
        const key = this.rowKey(tableId, rowId)
        this.data[key] = row;
    }

    getRow(tableId: number, rowId: string): KVRow|undefined {
        const key = this.rowKey(tableId, rowId)
        // try from cache
        if (this.deleted.has({tableId, rowId})) return undefined;
        if (this.data[key]) return this.data[key]

        // not found so find in storage
        const row = localStorage.getItem(key)
        if (!row) return undefined;

        this.data[key] = JSON.parse(row);
        return this.data[key];
    }

    hasRow(tableId: number, rowId: string): boolean {
        const key = this.rowKey(tableId, rowId);
        if (this.data[key]) return true;
        return !!localStorage.getItem(key);
    }

    delRow(tableId: number, rowId: string): boolean {
        const row = this.getRow(tableId, rowId);
        if (row) {
            this.deleted.add({tableId, rowId})
            return true
        }
        return false
    }

    private rowKey(tableId: number, rowId: string): string {
        return `${this.prefix}_${KvConstraints.TABLE}${tableId}_${KvConstraints.ROW}${rowId}`
    }

    private commitDeleted() {
        for (let d of this.deleted) {
            const row = this.getRow(d.tableId, d.rowId)
            const t = this.op.table.getId(d.tableId);
            if (t.cons.pk.first == d.rowId) {
                t.cons.pk.first = row?.next
            }
            // fix double linked list
            if (row && row.next && row.prev) { // fix in the middle
                const next = this.getRow(d.tableId, row.next);
                const prev = this.getRow(d.tableId, row.prev);
                if (next && prev) {
                    next.prev = prev.id
                    prev.next = next.id
                    localStorage.setItem(this.rowKey(d.tableId, prev.id), JSON.stringify(prev))
                    localStorage.setItem(this.rowKey(d.tableId, next.id), JSON.stringify(next))
                }
            } else if (row && row.prev) { // fix last
                const prev = this.getRow(d.tableId, row.prev);
                if (prev) {
                    prev.next = undefined;
                    localStorage.setItem(this.rowKey(d.tableId, prev.id), JSON.stringify(prev))
                }
            } else if (row && row.next) { // fix first
                const next = this.getRow(d.tableId, row.next);
                if (next) {
                    next.prev = undefined;
                    localStorage.setItem(this.rowKey(d.tableId, next.id), JSON.stringify(next))
                }
            }
            const key = this.rowKey(d.tableId, d.rowId)
            localStorage.removeItem(key)
        }
    }
}