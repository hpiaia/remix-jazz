import { z } from 'zod'

import { createRequestValidator } from '../../src/server'
import { createRequest, expectThrowForbidden, expectThrowUnprocessableEntity } from '../utils'

describe('request handler', () => {
  const myRequest = createRequestValidator({
    schema: z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(8),
    }),

    authorize: async (request) => !request.url.includes('admin'),
  })

  describe('when request is not authorized', () => {
    it('should throw a 403 response when not authorized', async () => {
      const body = new FormData()

      body.append('name', 'John Doe')
      body.append('email', 'john@doe.com')
      body.append('password', '12345678')

      const request = createRequest({
        method: 'post',
        body,
        url: '/admin',
      })

      expectThrowForbidden(myRequest(request).formDataOrThrow)
    })
  })

  describe('when request is authorized', () => {
    it('should pass authorization when no function is present', async () => {
      const noAuthValidator = createRequestValidator({
        schema: z.object({
          name: z.string(),
        }),
      })

      const body = new FormData()

      body.append('name', 'John Doe')

      const request = createRequest({
        method: 'post',
        body,
        url: '/admin',
      })

      const { success, errors, data } = await noAuthValidator(request).formData()

      expect(success).toBe(true)
      expect(errors).toBeUndefined()
      expect(data).toBeDefined()
    })

    describe('when request body is invalid', () => {
      it('formDataOrThrow should throw 422 when formData is not valid', async () => {
        const request = createRequest({
          method: 'post',
          body: new FormData(),
        })

        expectThrowUnprocessableEntity(myRequest(request).formDataOrThrow)
      })

      it('formDataOrThrow should throw exception when body is malformated', async () => {
        const request = new Request('http://localhost', {
          method: 'POST',
          body: 'invalid-body',
        })

        expect(myRequest(request).formDataOrThrow).rejects.toThrow()
      })

      it('formData should validate input', async () => {
        const body = new FormData()

        const request = createRequest({ method: 'post', body })

        const { success, errors, data } = await myRequest(request).formData()

        expect(success).toBe(false)
        expect(errors).toBeDefined()
        expect(data).toBeUndefined()

        expect(errors).toEqual({
          formErrors: [],
          fieldErrors: {
            name: ['Required'],
            email: ['Required'],
            password: ['Required'],
          },
        })
      })
    })

    describe('when request body is valid', () => {
      it('formData should parse input', async () => {
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

      it('formDataOrThrow should parse input', async () => {
        const body = new FormData()

        body.append('name', 'John Doe')
        body.append('email', 'john@doe.com')
        body.append('password', '12345678')

        const request = createRequest({
          method: 'post',
          body,
        })

        const data = await myRequest(request).formDataOrThrow()

        expect(data).toEqual({
          name: 'John Doe',
          email: 'john@doe.com',
          password: '12345678',
        })
      })
    })
  })
})
