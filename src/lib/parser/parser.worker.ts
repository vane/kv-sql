import {parse} from "../../gen/sqlite.parser";
import {Logger} from "../logger";
addEventListener('message', (msg) => {
    Logger.debug('<- parse.worker', msg)
    try {
        const ast = parse(msg.data);
        postMessage({status: 1, data: ast})
    } catch (e) {
        postMessage({status: 0, data: JSON.stringify(e)})
    }
})