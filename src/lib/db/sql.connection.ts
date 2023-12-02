import {asyncParser} from "../parser/async.parser";
import {Logger} from "../logger";
import {KVStore} from "./kv/kv.store";
import {createTableStmt} from "./stmt/create.table.stmt";
import {DBError, DBErrorType} from "./db.error";
import {insertStmt} from "./stmt/insert.stmt";
import {Benchmark} from "../benchmark";
import {selectStmt} from "./stmt/select.stmt";

export class SQLConnection {
    private readonly kv: KVStore;

    constructor(private prefix: string) {
        this.kv = new KVStore(prefix);
    }

    async execute(query: string) {
        Benchmark.start('SQLConnection.asyncParser');
        const ast = await asyncParser(query);
        Benchmark.stop('SQLConnection.asyncParser');
        if (!ast) {
            Logger.warn('Empty ast', ast);
            return;
        }
        if (ast.type !== 'statement' || ast.variant !== 'list') throw new DBError(DBErrorType.NOT_IMPLEMENTED);

        Benchmark.start('SQLConnection.executeStmt');
        this.kv.begin()
        const res = []
        for (const stmt of ast.statement) {
            const r = await this.executeStmt(stmt);
            res.push(r)
        }
        Benchmark.stop('SQLConnection.executeStmt', `${ast.statement.length} rows`);

        Benchmark.start('kv.commit');
        this.kv.commit()
        Benchmark.stop('kv.commit');
        return res
    }

    private executeStmt(q: any): any {
        switch (q.variant) {
            case 'transaction': {
                return this.resolveTx(q);
            }
            case 'create': {
                if (q.format === 'table') return createTableStmt(q, this.kv);
                break;
            }
            case 'insert': {
                return insertStmt(q, this.kv);
            }
            case 'select': {
                return selectStmt(q, this.kv);
            }
            default: {
                Logger.warn(`Unsupported statement type ${q.variant}`, q)
            }
        }
        return undefined;
    }

    private resolveTx(q: any) {
        switch (q.action) {
            case 'begin':
            case 'commit':
            default: {
                Logger.warn('SQLConnection.resolveTx not implemented', q);
            }
        }
    }

    keys(): string[] {
        const keys = []
        for (let key of Object.keys(localStorage)) {
            if (key.startsWith(this.prefix)) {
                keys.push(key)
            }
        }
        return keys
    }

    clear(): void {
        for (let key of Object.keys(localStorage)) {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
        this.kv.clear();
    }
}