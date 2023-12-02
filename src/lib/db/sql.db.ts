import {SQLConnection} from "./sql.connection";


export class SQLDb {
    static connect(name: string): SQLConnection {
        return new SQLConnection(name);
    }
}