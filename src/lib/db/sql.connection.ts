import {asyncParser} from "../parser/async.parser";
import {Logger} from "../logger";
import {KvOp} from "./kv/kv.op";
import {createTableStmt} from "./stmt/create.table.stmt";
import {DBError, DBErrorType} from "./db.error";
import {insertStmt} from "./stmt/insert.stmt";
import {Benchmark} from "../benchmark";
import {selectStmt} from "./stmt/select.stmt";
import {updateStmt} from "./stmt/update.stmt";
import {deleteStmt} from "./stmt/delete.stmt";

export class SQLConnection {
    private readonly kv: KvOp;

    constructor(private prefix: string) {
        this.kv = new KvOp(prefix);
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
        switch (q.variant.toLowerCase()) {
            case 'transaction': {
                Logger.warn('SQLConnection.executeStmt "transaction" not implemented', q);
                break;
            }
            case 'create': {
                if (q.format.toLowerCase() === 'table') return createTableStmt(q, this.kv);
                Logger.warn(`Unsupported create format ${q.format}`, q)
                break;
            }
            case 'insert': {
                return insertStmt(q, this.kv);
            }
            case 'select': {
                return selectStmt(q, this.kv);
            }
            case 'update': {
                return updateStmt(q, this.kv);
            }
            case 'delete': {
                return deleteStmt(q, this.kv);
            }
            default: {
                Logger.warn(`Unsupported statement type ${q.variant}`, q)
            }
        }
        return undefined;
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