import {KvOp} from "./kv.op";
import {Logger} from "../../logger";
import {KVTableCol, KVTableConsPk, KVTables} from "./kv.model";
import {InsertDataType, InsertResultType, InsertResultVariant, SqlDatatype} from "../../parser/sql.parser.model";

interface SpecialCol {
    name: string
    type: SqlDatatype
}

export class KvSpecial {
    private tableName = 'sqlite_schema'
    private tableCols: SpecialCol[] = [{
        name: 'id',
        type: SqlDatatype.integer
    }, {
        name: 'type',
        type: SqlDatatype.nvarchar
    }, {
        name: 'name',
        type: SqlDatatype.nvarchar,
    }, {
        name: 'tbl_name',
        type: SqlDatatype.nvarchar,
    }, {
        name: 'rootpage',
        type: SqlDatatype.integer
    }, {
        name: 'sql',
        type: SqlDatatype.text
    }]
    constructor(private prefix: string, private op: KvOp) {
        Logger.debug('KvOpDelete.constructor', prefix)
    }

    init(): KVTables {
        const tables = {
            id: 0,
            defs: {},
        };
        this.initSchema(tables)
        return tables;
    }

    addTable(tname: string) {
        const def = this.op.table.getId(1)
        let id = '1'
        if (def.cons.pk.id) {
            id = (parseInt(def.cons.pk.id)+1).toString()
        }
        this.op.insert.table(this.tableName, [{
            type: InsertResultType.expression,
            variant: InsertResultVariant.list,
            expression: [{
                type: InsertDataType.literal,
                variant: SqlDatatype.integer,
                value: id
            }, {
                type: InsertDataType.literal,
                variant: SqlDatatype.nvarchar,
                value: 'table'
            },{
                type: InsertDataType.literal,
                variant: SqlDatatype.nvarchar,
                value: tname
            },{
                type: InsertDataType.literal,
                variant: SqlDatatype.nvarchar,
                value: tname
            },{
                type: InsertDataType.literal,
                variant: SqlDatatype.integer,
                value: '2'
            },{
                type: InsertDataType.literal,
                variant: SqlDatatype.text,
                value: ''
            }]
        }])
    }

    private initSchema(tables: KVTables) {
        ++tables.id
        const pk: KVTableConsPk = {auto: true, name: 'id', cname: ['id']}
        const colData = this.initCols()
        tables.defs[this.tableName] = {
            id: tables.id,
            name: this.tableName,
            conid: 0,
            colid: colData.id,
            cons: {defs: {}, pk},
            cols: colData.cols,
            idx: colData.idx
        };
    }

    private initCols(): {cols: {[key: string]: KVTableCol}, id: number, idx: string[]} {
        const cols = {}
        let id = 0
        let idx = []
        for (const c of this.tableCols) {
            ++id
            cols[c.name] = {
                id,
                name: c.name,
                type: c.type,
                notNull: true
            }
            idx.push(c.name)
        }
        return {cols, id, idx};
    }
}