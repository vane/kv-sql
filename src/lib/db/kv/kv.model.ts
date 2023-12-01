import {Column, Constraint, DatatypeVariant} from "../../parser/sql.parser.model";

export interface KVTableConst {
    id : number;
    pk: boolean;
    fk: boolean;
    cname?: string[];
    name: string;
    /** @deprecated */
    cons: Constraint;
}

export interface KVTableConstList {
    pk?: string;
    defs: KVTableConst[]
}


export interface KVTableCol {
    id: number;
    name: string;
    type: DatatypeVariant;
    notNull: boolean;
    /** @deprecated */
    col: Column;
}

export interface KVTableColMap {
    [key: string]: KVTableCol
}

export interface KVTableDef {
    id: number;
    cons: KVTableConstList;
    cols: KVTableColMap;
}

export interface KVTableDefMap {
    [key: string]: KVTableDef
}

export interface KVTables {
    id: number;
    defs: KVTableDefMap;
}

