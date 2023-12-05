import {DBError, DBErrorType} from "./db.error";
import {Benchmark} from "../benchmark";
import {KvOp} from "./kv/kv.op";
import {Logger} from "../logger";
import {asyncParser} from "../parser/async.parser";

export class SQLConnection {
    private readonly kv: KvOp;

    constructor(private prefix: string) {
        this.kv = new KvOp(prefix);
    }

    async execute(query: string, commit = true) {
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
            const r = await this.kv.execute(stmt);
            res.push(r)
        }
        Benchmark.stop('SQLConnection.executeStmt', `${ast.statement.length} rows`);

        Benchmark.start('kv.commit');
        if (commit) this.kv.commit()
        Benchmark.stop('kv.commit');
        return res
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
        this.kv.rollback();
    }
}