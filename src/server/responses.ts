import { json } from '@remix-run/node'

/**
 * Create a response with the status code 201.
 */
export function created<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 201 })
}

/**
 * Create a response with the status code 400.
 */
export function badRequest<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 400 })
}

/**
 * Create a response with the status code 401.
 */
export function unauthorized<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 401 })
}

/**
 * Create a response with the status code 403.
 */
export function forbidden<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 403 })
}

/**
 * Create a response with the status code 404.
 */
export function notFound<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 404 })
}

/**
 * Create a response with the status code 422.
 */
export function unprocessableEntity<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 422 })
}

/**
 * Create a response with the status code 500.
 */
export function internalServerError<Data = unknown>(data: Data, init?: Omit<ResponseInit, 'status'>) {
  return json(data, { ...init, status: 500 })
}
