import {KVTable} from "./kv.table";
import {Logger} from "../../logger";

export class KvOpUpdate {
    constructor(private prefix: string, private tb: KVTable) {
        Logger.debug('KvOpUpdate', prefix)
    }

    commit() {

    }

    rollback() {

    }

}