import {ConstraintActionVariant, DatatypeVariant} from "../../parser/sql.parser.model";

export interface KVTableConsPk {
    id?: string;
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

export interface KVTableConsMap {
    pk?: string;
    defs: {[key: string]: KVTableCons}
}


export interface KVTableCol {
    id: number;
    name: string;
    type: DatatypeVariant;
    notNull: boolean;
}

export interface KVTableDef {
    id: number;
    name: string;
    conid: number;
    colid: number;
    cons: KVTableConsMap;
    cols: {[key: string]: KVTableCol};
}

export interface KVTables {
    id: number;
    defs: {[key: string]: KVTableDef};
}

