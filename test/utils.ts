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
