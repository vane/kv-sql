import {DatatypeVariant} from "../../parser/sql.parser.model";

export const dbEvalValue = (val: string, type: DatatypeVariant) => {
    switch (type) {
        case DatatypeVariant.integer:
            return parseInt(val)
        case DatatypeVariant.numeric:
            return parseFloat(val)
    }
    return val
}