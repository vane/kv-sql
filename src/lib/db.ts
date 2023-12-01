import {asyncParser} from "./parser/async.parser";
import {Logger} from "./logger";

class DBError extends Error {
    static TABLE_EXISTS = 'TABLE_EXISTS'
    constructor(type: string, name: string) {
        super(`${type} - ${name}`)
    }
}

enum KVKeys {
    TABLE_DEFINITION = 'td'
}

class KVTable {
    private readonly td: any;

    constructor(private prefix: string) {
        const tdPrefix = `${this.prefix}_${KVKeys.TABLE_DEFINITION}`
        const td = localStorage.getItem(tdPrefix)
        if (!td) {
            localStorage.setItem(tdPrefix, JSON.stringify({}));
            this.td = {};
        } else {
            this.td = td;
        }
        Logger.debug('KVTable', prefix, 'td', this.td);
    }

    has = (name: string): boolean => {
        Logger.debug(name in this.td);
        return this.td.has(name)
    }

    add(name: string, cols: string) {

    }
}

class KVStore {
    readonly table: KVTable
    constructor(private prefix: string) {
        this.table = new KVTable(prefix);
    }


}

const createVisitor = (q: Create, kv: KVStore) => {
    switch (q.keyword) {
        case 'table': {
            const t = q.table[0]
            Logger.debug(t);
            if (kv.table.has(t.table)) throw new DBError(DBError.TABLE_EXISTS, t.table)
            break;
        }
        default:
            Logger.debug(`createVisitor not implemented keyword ${q.keyword}`, q, kv)
    }
}

class SQLConnection {
    private kv: KVStore;
    constructor(private prefix: string) {
        this.kv = new KVStore(prefix);
    }

    async execute(query: string) {
        const ast = await asyncParser(query);
        Logger.debug('ast', ast)
    }

    private executeOne(q: any) {
        switch (q.type) {
            case 'create': {
                createVisitor(q, this.kv)
                break
            }
            default: {
                Logger.warn(`Unsupported query type ${q.type}`, q)
            }
        }
    }
}

export class SQLDb {
    static connect(name: string): SQLConnection {
        return new SQLConnection(name);
    }
}