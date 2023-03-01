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

export function expectRejectResponseWithStatus<Result>(fn: () => Promise<Result>, status: number) {
  expect(fn).rejects.toEqual(expect.objectContaining({ status }))
}

export function expectThrowForbidden(fn: () => Promise<unknown>) {
  return expectRejectResponseWithStatus(fn, 403)
}

export function expectThrowUnprocessableEntity(fn: () => Promise<unknown>) {
  return expectRejectResponseWithStatus(fn, 422)
}
