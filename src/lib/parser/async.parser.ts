import {Logger} from "../logger";

const w = new Worker(
    new URL('./parser.worker', import.meta.url),
    {type: 'module'}
);
export const asyncParser = (query: string) => {
    return new Promise((resolve, reject) => {
        const handler = (msg) => {
            w.removeEventListener('message', handler);
            Logger.debug('->asyncParse', msg);
            const {status, data} = msg.data;
            status ? resolve(data) : reject(data);
        }
        w.addEventListener('message', handler);
        w.postMessage(query)
        /*try {
            const ast = parse(query);
            resolve(ast);
        } catch (e) {
            reject(e);
        }*/
    })
}