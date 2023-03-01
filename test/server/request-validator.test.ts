import { z } from 'zod'

import { createRequestValidator } from '../../src/server'
import { createRequest } from '../utils'

describe('request handler', () => {
  const myRequest = createRequestValidator({
    schema: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
    }),

    authorize: async (request) => !request.url.includes('nope'),
  })

  it('should validate formData input', async () => {
    const body = new FormData()

    const request = createRequest({ method: 'post', body })

    const { success, errors, data } = await myRequest(request).formData()

    expect(success).toBe(false)
    expect(errors).toBeDefined()
    expect(data).toBeUndefined()

    expect(errors?.fieldErrors).toEqual({
      name: ['Required'],
      email: ['Required'],
      password: ['Required'],
    })
  })

  it('should parse formData input', async () => {
    const body = new FormData()

    body.append('name', 'John Doe')
    body.append('email', 'john@doe.com')
    body.append('password', '12345678')

    const request = createRequest({
      method: 'post',
      body,
    })

    const { success, errors, data } = await myRequest(request).formData()

    expect(success).toBe(true)
    expect(errors).toBeUndefined()
    expect(data).toBeDefined()

    expect(data).toEqual({
      name: 'John Doe',
      email: 'john@doe.com',
      password: '12345678',
    })
  })

  it('should throw an error when formData input is invalid', async () => {
    const body = new FormData()

    const request = createRequest({
      method: 'post',
      body,
    })

    expect(myRequest(request).formDataOrThrow).rejects.toThrowErrorMatchingSnapshot()
  })

  it('should throw a 403 response when request is not authorized', async () => {
    const body = new FormData()

    body.append('name', 'John Doe')
    body.append('email', 'john@doe.com')
    body.append('password', '12345678')

    const request = createRequest({
      method: 'post',
      body,
      url: '/nope',
    })

    try {
      await myRequest(request).formDataOrThrow()
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).status).toBe(403)
    }
  })
})
