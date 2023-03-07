import { expect } from 'vitest'

export function createRequest({
  url,
  method,
  body: body,
}: {
  url?: string
  method: 'get' | 'post' | 'put' | 'delete'
  body: BodyInit | null | undefined
}) {
  return new Request('http://localhost:3000/' + url, {
    method,
    body,
  })
}

export function expectRejectWithStatus<Result>(fn: () => Promise<Result>, status: number) {
  expect(fn).rejects.toEqual(expect.objectContaining({ status }))
}

export function expectThrowForbidden(fn: () => Promise<unknown>) {
  return expectRejectWithStatus(fn, 403)
}

export function expectThrowUnprocessableEntity(fn: () => Promise<unknown>) {
  return expectRejectWithStatus(fn, 422)
}
