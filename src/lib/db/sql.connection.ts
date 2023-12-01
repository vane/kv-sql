import {asyncParser} from "../parser/async.parser";
import {Logger} from "../logger";
import {createVisitor} from "./visitor/create.visitor";
import {KVStore} from "./kv/kv.store";

export class SQLConnection {
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