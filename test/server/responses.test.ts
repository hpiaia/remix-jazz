import {
  badRequest,
  created,
  forbidden,
  internalServerError,
  notFound,
  unauthorized,
  unprocessableEntity,
} from '../../src/server'

describe('server responses', () => {
  it('should return 201 for created', async () => {
    const response = created({ message: 'created' })
    expect(response.status).toBe(201)
  })

  it('should return 400 for bad request', async () => {
    const response = badRequest({ message: 'bad request' })
    expect(response.status).toBe(400)
  })

  it('should return 401 for unauthorized', async () => {
    const response = unauthorized({ message: 'unauthorized' })
    expect(response.status).toBe(401)
  })

  it('should return 403 for forbidden', async () => {
    const response = forbidden({ message: 'forbidden' })
    expect(response.status).toBe(403)
  })

  it('should return 404 for not found', async () => {
    const response = notFound({ message: 'not found' })
    expect(response.status).toBe(404)
  })

  it('should return 422 for unprocessable entity', async () => {
    const response = unprocessableEntity({ message: 'unprocessable entity' })
    expect(response.status).toBe(422)
  })

  it('should return 500 for internal server error', async () => {
    const response = internalServerError({ message: 'internal server error' })
    expect(response.status).toBe(500)
  })
})
