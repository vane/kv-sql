//////////////////////////
// CONSTRAINT
//////////////////////////

export enum ConstraintDefinitionVariant {
    fk = 'foreign key',
    pk = 'primary key'
}

export enum ConstraintAction {
    no_action = 'no action'
}

export enum ConstraintActionVariant {
    delete = 'delete',
    update = 'update'
}

export interface ConstraintDefinitionAction {
    type: string;
    variant: ConstraintActionVariant;
    action: ConstraintAction;
}

export interface ConstraintDefinitionReference {
    format: string;
    name: string;
    type: string;
    variant: string;
    columns: ConstraintColumn[];
}

export interface ConstraintDefinition {
    type: ConstraintDefinitionVariant;
    variant: ConstraintDefinitionVariant;
    autoIncrement?: boolean;
    action?: ConstraintDefinitionAction[];
    references?: ConstraintDefinitionReference;
}

export enum ConstraintColumnType {
    identifier = 'identifier'
}

export enum ConstraintColumnVariant {
    column = 'column'
}

export interface ConstraintColumn {
    name: string;
    type: ConstraintColumnType;
    variant: ConstraintColumnVariant;
}

export interface Constraint extends CVariant {
    name?: string;
    columns: ConstraintColumn[];
    definition: ConstraintDefinition[];
}

//////////////////////////
// COLUMN
//////////////////////////
export enum DatatypeAffinity {
    text = 'text',
    integer = 'integer',
}

export enum DatatypeVariant {
    datetime = 'datetime',
    integer = 'integer',
    nvarchar = 'nvarchar',
    numeric = 'numeric'
}

export interface ColumnDatatype {
    affinity: DatatypeAffinity;
    variant: DatatypeVariant;
}

export enum ColumnDefinitionType {
    constraint = 'constraint',
}

export enum ColumnDefinitionVariant {
    not_null = 'not null',
}

export interface ColumnDefinition {
    type: ColumnDefinitionType;
    variant: ColumnDefinitionVariant;
}

export enum VariantDefinition {
    column = 'column',
    constraint = 'constraint'
}

export interface CVariant {
    variant: VariantDefinition;
}

export interface Column extends CVariant {
    name: string;
    datatype: ColumnDatatype;
    definition: ColumnDefinition[];
}

export interface Table {
    cols: Column|Constraint[]
}