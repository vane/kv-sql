import {ConstraintActionVariant, SqlDatatype} from "../../parser/sql.parser.model";

export interface KVResultRow {
    _id: string;
    [key:string]: any;
}

export interface KVTableConsPk {
    id?: string;
    first?: string;
    name?: string;
    auto: boolean;
    cname?: string[];
}

export interface KVTableConsFk {
    upd?: ConstraintActionVariant;
    del?: ConstraintActionVariant;
}

export interface KVTableCons {
    id : number;
    fk?: KVTableConsFk;
    cname?: string[];
    name: string;
}

export interface KVTableConsMap {
    pk: KVTableConsPk;
    defs: {[key: string]: KVTableCons}
}


export interface KVTableCol {
    id: number;
    name: string;
    type: SqlDatatype;
    notNull: boolean;
    defaultValue?: string;
}

export interface KVTableDef {
    id: number;
    name: string;
    conid: number;
    colid: number;
    cons: KVTableConsMap;
    cols: {[key: string]: KVTableCol};
    idx: string[];
}

export interface KVTables {
    id: number;
    defs: {[key: string]: KVTableDef};
}

export interface KVRow {
    id: string
    next?: string
    prev?: string
    data: string[]
}
