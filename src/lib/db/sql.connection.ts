import {asyncParser} from "../parser/async.parser";
import {Logger} from "../logger";
import {KVStore} from "./kv/kv.store";
import {createTableStmt} from "./stmt/create.table.stmt";
import {DBError, DBErrorType} from "./db.error";
import {insertStmt} from "./stmt/insert.stmt";
import {Benchmark} from "../benchmark";

export class SQLConnection {
    private readonly kv: KVStore;

    constructor(private prefix: string) {
        this.kv = new KVStore(prefix);
    }

    async execute(query: string) {
        Benchmark.start('SQLConnection.asyncParser');
        const ast = await asyncParser(query);
        Logger.debug('SQLConnection.execute.ast', ast, 'in');
        Benchmark.stop('SQLConnection.asyncParser');
        if (ast.type !== 'statement' || ast.variant !== 'list') throw new DBError(DBErrorType.NOT_IMPLEMENTED);
        Benchmark.start('SQLConnection.executeStmt');
        for (const stmt of ast.statement) {
            await this.executeStmt(stmt);
        }
        Benchmark.stop('SQLConnection.executeStmt', ast.statement.length);
        Logger.debug('kv.table', this.kv.table.dump());
        Logger.debug('kv.ops', this.kv.op.dump());
    }

    private executeStmt(q: any) {
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
            default: {
                Logger.warn(`Unsupported statement type ${q.variant}`, q)
            }
        }
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
}