export enum DBErrorType {
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
    TABLE_EXISTS = 'TABLE_EXISTS',
    PK_EXISTS = 'PRIMARY_KEY_EXISTS',
}


export class DBError extends Error {
    constructor(type: DBErrorType, msg: string = '') {
        super(`${type} - ${msg}`)
    }
}