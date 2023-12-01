import {KvConstraints} from "./kv.constraints";
import {Logger} from "../../logger";

export class KvRow {
    constructor(private prefix: string) {
        Logger.debug('KVTable', prefix, 'td', this.td);
    }
}