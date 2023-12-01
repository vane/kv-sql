import {Column, Constraint, ConstraintActionVariant, DatatypeVariant} from "../../parser/sql.parser.model";

export interface KVTableConsPk {
    auto: boolean;
}

export interface KVTableConsFk {
    upd?: ConstraintActionVariant;
    del?: ConstraintActionVariant;
}

export interface KVTableCons {
    id : number;
    pk?: KVTableConsPk;
    fk?: KVTableConsFk;
    cname?: string[];
    name: string;
}

export interface KVTableConsDefs {
    [key: string]: KVTableCons
}

export interface KVTableConsMap {
    pk?: string;
    defs: KVTableConsDefs
}


export interface KVTableCol {
    id: number;
    name: string;
    type: DatatypeVariant;
    notNull: boolean;
}

export interface KVTableColMap {
    [key: string]: KVTableCol
}

export interface KVTableDef {
    id: number;
    cons: KVTableConsMap;
    cols: KVTableColMap;
}

export interface KVTableDefMap {
    [key: string]: KVTableDef
}

export interface KVTables {
    id: number;
    defs: KVTableDefMap;
}

