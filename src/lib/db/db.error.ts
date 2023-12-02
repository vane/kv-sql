export enum DBErrorType {
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
    TABLE_EXISTS = 'TABLE_EXISTS',
    TABLE_NOT_EXISTS = 'TABLE_NOT_EXISTS',
    COLUMN_NOT_EXISTS = 'COLUMN_NOT_EXISTS',
    PK_EXISTS = 'PRIMARY_KEY_EXISTS',
    FK_EXISTS = 'FOREIGN_KEY_EXISTS',
    INSERT_ROW_SIZE = 'INSERT_ROW_SIZE',
    INSERT_MISSING_PK = 'INSERT_MISSING_PK'
}


export class DBError extends Error {
    constructor(type: DBErrorType, msg: string = '') {
        super(`${type} - ${msg}`)
    }
}