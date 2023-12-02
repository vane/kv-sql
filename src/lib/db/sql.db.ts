import {SQLConnection} from "./sql.connection";


export class SQLDb {
    static connect(name: string): SQLConnection {
        return new SQLConnection(name);
    }

    static clear(name: string): void {
        for (let key of Object.keys(localStorage)) {
            if (key.startsWith(name)) {
                localStorage.removeItem(key);
            }
        }
    }
}