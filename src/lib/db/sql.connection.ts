import {asyncParser} from "../parser/async.parser";
import {Logger} from "../logger";
import {KVStore} from "./kv/kv.store";
import {createTableStmt} from "./stmt/create.table.stmt";
import {DBError, DBErrorType} from "./db.error";

export class SQLConnection {
    private readonly kv: KVStore;

    constructor(private prefix: string) {
        this.kv = new KVStore(prefix);
    }

    async execute(query: string) {
        const ast = await asyncParser(query);
        Logger.debug('SQLConnection.execute.ast', ast);
        if (ast.type !== 'statement' || ast.variant !== 'list') throw new DBError(DBErrorType.NOT_IMPLEMENTED);
        for (const stmt of ast.statement) {
            await this.executeStmt(stmt);
        }
        Logger.debug('kv.table', this.kv.table.dump());
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