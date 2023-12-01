import {Logger} from "../../logger";
import {KvConstraints} from "./kv.constraints";
import {
    Column,
    ColumnDefinitionVariant,
    Constraint,
    ConstraintColumnVariant,
    ConstraintDefinitionVariant,
    CVariant,
    DatatypeVariant,
    VariantDefinition,
} from "../../parser/sql.parser.model";
import {DBError, DBErrorType} from "../db.error";

interface TConst {
    id : number;
    pk: boolean;
    fk: boolean;
    cname?: string[];
    name: string;
    /** @deprecated */
    cons: Constraint;
}

interface TConsts {
    pk?: string;
    defs: TConst[]
}

interface TCol {
    id: number;
    name: string;
    type: DatatypeVariant;
    notNull: boolean;
    /** @deprecated */
    col: Column;
}

interface TCols {
    [key: string]: TCol
}

interface TDef {
    id: number;
    cons: TConsts;
    cols: TCols;
}

interface TDefs {
    [key: string]: TDef
}

interface TD {
    id: number;
    defs: TDefs;
    [key: string]: any
}

export class KVTable {
    private td: TD;
    private readonly tdPrefix: string;

    constructor(private prefix: string) {
        this.tdPrefix = `${this.prefix}_${KvConstraints.TABLE_DEFINITION}`
        this.td = this.loadTd();
        Logger.debug('KVTable', prefix, 'td', this.td);
    }

    has = (name: string): boolean => {
        return !!this.td.defs[name]
    }

    add(name: string, cols: Column[]) {
        Logger.log('KVTable.add', name, cols);
        ++this.td.id;
        this.td.defs[name] = {id: this.td.id, cons: {defs: []}, cols: {}};
        this.createTable(name, cols);
    }

    commit() {
        localStorage.setItem(this.tdPrefix, JSON.stringify(this.td));
    }

    rollback() {
        this.td = this.loadTd();
    }

    dump() {
        return this.td;
    }

    private loadTd(): TD {
        const td = localStorage.getItem(this.tdPrefix)
        // initial value
        if (!td) return {
            id: 0,
            defs: {}
        };
        return JSON.parse(td);
    }

    private createTable(name: string, cols: CVariant[]) {
        let id = 0;
        let cid = 0;
        for (let col of cols) {
            switch (col.variant) {
                case VariantDefinition.column: {
                    ++id;
                    const c = this.createColumn(col as Column, id);
                    this.td.defs[name].cols[c.name] = c;
                    break;
                }
                case VariantDefinition.constraint: {
                    ++cid;
                    const c = this.createConstraint(col as Constraint, cid);
                    if (c.pk) {
                        if (this.td.defs[name].cons.pk) throw new DBError(DBErrorType.PK_EXISTS, this.td.defs[name].cons.pk);
                        this.td.defs[name].cons.pk = c.name;
                    }
                    // todo validate if exists
                    this.td.defs[name].cons.defs.push(c);
                    break;
                }
                default: {
                    Logger.warn('KVTable.createTable unsupported variant', col.variant, col);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED);
                }
            }
        }
    }

    private createColumn(col: Column, id: number):TCol  {
        switch (col.datatype.variant) {
            case DatatypeVariant.datetime:
            case DatatypeVariant.integer:
            case DatatypeVariant.numeric:
            case DatatypeVariant.nvarchar:
                break
            default: {
                Logger.debug('createColumn', col);
                throw new DBError(DBErrorType.NOT_IMPLEMENTED, col.datatype.variant)
            }
        }
        let notNull = false;
        for (let def of col.definition) {
            switch (def.variant) {
                case ColumnDefinitionVariant.not_null:
                    notNull = true;
                    break;
                default: {
                    Logger.debug('createColumn.def', col.name, def);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, col.datatype.variant)
                }
            }
        }
        return {id, type: col.datatype.variant, name: col.name, notNull, col};
    }

    private createConstraint(cons: Constraint, id: number): TConst {
        Logger.log('createConstraint', cons);
        let pk = false;
        let fk = false;
        let name = cons.name;
        let cname = [];
        for (let col of cons.columns) {
            switch (col.variant) {
                case ConstraintColumnVariant.column: {
                    cname.push(col.name)
                    break;
                }
                default: {
                    Logger.debug('createConstraint.col.variant', cons, col);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, col.variant)
                }
            }
        }
        for (let def of cons.definition) {
            switch (def.variant) {
                case ConstraintDefinitionVariant.fk:
                    fk = true;
                    break;
                case ConstraintDefinitionVariant.pk:
                    pk = true;
                    break;
                default: {
                    Logger.debug('createConstraint.def', cons, def);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, def.variant)
                }
            }
        }
        if (!name) {
            name = ''
            for (let c of cname) {
                name += `${c}_`
            }
            if (fk) name += 'fk'
            if (pk) name += 'pk'
        } else {
            Logger.warn('KVTable.createConstraint', cons, name, {fk, pk, name, cname, cons});
        }
        return {id, fk, pk, name, cname, cons}
    }
}