import {Logger} from "../../logger";
import {KvConstraints} from "./kv.constraints";
import {
    Column,
    ColumnDefinitionVariant,
    Constraint, ConstraintAction,
    ConstraintColumnVariant, ConstraintDefinition,
    ConstraintDefinitionVariant,
    CVariant,
    DatatypeVariant,
    VariantDefinition,
} from "../../parser/sql.parser.model";
import {DBError, DBErrorType} from "../db.error";
import {KVTableCol, KVTableCons, KVTableConsFk, KVTableDef, KVTables} from "./kv.model";


export class KVTable {
    td: KVTables;
    private readonly tdPrefix: string;

    constructor(private prefix: string) {
        this.tdPrefix = `${this.prefix}_${KvConstraints.TABLE_DEFINITION}`
        this.td = this.loadTd();
    }

    has = (name: string): boolean => {
        return !!this.td.defs[name]
    }

    add(name: string, cols: Column[]) {
        Logger.log('KVTable.add', name, cols);
        ++this.td.id;
        const def: KVTableDef = {
            id: this.td.id,
            name,
            conid: 0,
            colid: 0,
            cons: {defs: {}, pk: {auto: false}},
            cols: {},
            idx: []
        }
        this.td.defs[name] = def
        this.createTable(def, cols);
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

    private loadTd(): KVTables {
        const td = localStorage.getItem(this.tdPrefix)
        // initial value
        if (!td) return {
            id: 0,
            defs: {},
        };
        return JSON.parse(td);
    }

    private createTable(def: KVTableDef, cols: CVariant[]) {
        Logger.debug('createTable', def)
        for (let col of cols) {
            switch (col.variant) {
                case VariantDefinition.column: {
                    ++def.colid;
                    const c = this.createColumn(col as Column, def.colid);
                    def.cols[c.name] = c;
                    def.idx.push(c.name)
                    break;
                }
                case VariantDefinition.constraint: {
                    ++def.conid;
                    const c = this.createConstraint(def, col as Constraint, def.conid);
                    if (!c) {
                        Logger.warn('KVTable.createTable.createConstraint empty', col);
                        break;
                    }
                    // check if fk exists
                    if (def.cons.defs[c.name]) {
                        throw new DBError(DBErrorType.FK_EXISTS, def.cons.defs[c.name].name);
                    }
                    def.cons.defs[c.name] = c;
                    break;
                }
                default: {
                    Logger.warn('KVTable.createTable unsupported variant', col.variant, col);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED);
                }
            }
        }
    }

    private createColumn(col: Column, id: number):KVTableCol  {
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
        return {id, type: col.datatype.variant, name: col.name, notNull};
    }

    private createConstraint(def: KVTableDef, cons: Constraint, id: number): KVTableCons|undefined {
        let fk: KVTableConsFk|undefined = undefined;
        let pk = false;
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
        for (let d of cons.definition) {
            switch (d.variant) {
                case ConstraintDefinitionVariant.fk:
                    fk = this.createForeignKey(d);
                    break;
                case ConstraintDefinitionVariant.pk:
                    def.cons.pk.auto =!!d.autoIncrement;
                    pk = true;
                    break;
                default: {
                    Logger.debug('createConstraint.def', cons, def);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, d.variant)
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
            Logger.warn('KVTable.createConstraint', cons, name, {fk, name, cname, cons});
        }
        if (pk) {
            if (def.cons.pk.name)
                throw new DBError(DBErrorType.PK_EXISTS, def.cons.pk.name);
            def.cons.pk.name = name;
            def.cons.pk.cname = cname;
        }
        return {id, fk, name, cname}
    }

    private createForeignKey(def: ConstraintDefinition): KVTableConsFk|undefined {
        if (!def.action || !def.references) return undefined;
        const fk = {};
        for (const act of def.action) {
            switch (act.action) {
                case ConstraintAction.no_action:
                    break;
                default:
                    Logger.debug('createForeignKey.action', def, act);
                    throw new DBError(DBErrorType.NOT_IMPLEMENTED, act.action)
            }
        }
        return fk;
    }
}