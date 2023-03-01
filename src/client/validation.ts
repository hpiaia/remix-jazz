import { isMatching, P } from 'ts-pattern'

export const hasErrors = isMatching({ errors: P.any })
