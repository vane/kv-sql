export enum DBErrorType {
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
    TABLE_EXISTS = 'TABLE_EXISTS'
}


export class DBError extends Error {
    constructor(type: DBErrorType, msg: string = '') {
        super(`${type} - ${msg}`)
    }
}