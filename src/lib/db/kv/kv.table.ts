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
import {KVTableCol, KVTableCons, KVTableConsFk, KVTableConsPk, KVTables} from "./kv.model";


export class KVTable {
    private td: KVTables;
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
        this.td.defs[name] = {id: this.td.id, cons: {defs: {}}, cols: {}};
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

    private loadTd(): KVTables {
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
                    if (!c) {
                        Logger.warn('KVTable.createTable.createConstraint empty', col);
                        break;
                    }
                    if (c.pk) {
                        // check if pk exists
                        if (this.td.defs[name].cons.pk)
                            throw new DBError(DBErrorType.PK_EXISTS, this.td.defs[name].cons.pk);
                        this.td.defs[name].cons.pk = c.name;
                    }
                    // check if fk exists
                    if (this.td.defs[name].cons.defs[c.name]) {
                        throw new DBError(DBErrorType.FK_EXISTS, this.td.defs[name].cons.defs[c.name].name);
                    }
                    this.td.defs[name].cons.defs[c.name] = c;
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

    private createConstraint(cons: Constraint, id: number): KVTableCons|undefined {
        let pk: KVTableConsPk|undefined = undefined;
        let fk: KVTableConsFk|undefined = undefined;
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
                    fk = this.createForeignKey(def);
                    break;
                case ConstraintDefinitionVariant.pk:
                    pk = {auto: !!def.autoIncrement}
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
        return {id, fk, pk, name, cname}
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