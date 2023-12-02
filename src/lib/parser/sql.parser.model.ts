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

export enum ConstraintType {
    identifier = 'identifier'
}

export enum ConstraintVariant {
    column = 'column'
}

export interface ConstraintColumn {
    name: string;
    type: ConstraintType;
    variant: ConstraintVariant;
}

export interface Constraint extends CVariant {
    name?: string;
    columns: ConstraintColumn[];
    definition: ConstraintDefinition[];
}

//////////////////////////
// COLUMN
//////////////////////////

export enum SqlDatatype {
    datetime = 'datetime',
    integer = 'integer',
    nvarchar = 'nvarchar',
    numeric = 'numeric',
    decimal= 'decimal',
    text = 'text',
    null = 'null'
}

export interface ColumnDatatype {
    affinity: SqlDatatype;
    variant: SqlDatatype;
}

export enum ColumnDefinitionVariant {
    not_null = 'not null',
}

export interface ColumnDefinition {
    type: ConstraintType;
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

//////////////////////////
// TABLE
//////////////////////////
export interface Table {
    cols: Column|Constraint[]
}

//////////////////////////
// INSERT
//////////////////////////

export enum InsertResultVariant {
    list = 'list'
}

export enum InsertResultType {
    expression = 'expression'
}

export enum InsertDataType {
    literal = 'literal'
}

export interface InsertResultExpression {
    type: InsertDataType;
    variant: SqlDatatype;
    value: string;
}

export interface InsertResult {
    type: InsertResultType;
    variant: InsertResultVariant;
    expression: InsertResultExpression[];
}