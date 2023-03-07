import { describe, it, expect } from 'vitest'

import { createAuthStorage } from '../../src/server'

describe('authentication', () => {
  const storage = createAuthStorage({
    sessionSecret: 'secret',
    userSessionKey: 'userId',
  })

  function fakeRequest(cookie?: string | null) {
    return new Request('http://localhost', {
      headers: {
        cookie: cookie ?? '',
      },
    })
  }

  it('should get the created session', async () => {
    const session = await storage.getSession(fakeRequest())

    expect(session).toBeDefined()
  })

  it('should sign in without expiration', async () => {
    const response = await storage.signIn({
      request: fakeRequest(),
      userId: '123',
      redirectTo: '/',
    })

    const cookie = response.headers.get('set-cookie')
    const session = await storage.getSession(fakeRequest(cookie))

    expect(cookie).toBeDefined()
    expect(cookie).not.toContain('Max-Age=60')
    expect(session.data.userId).toBe('123')
  })

  it('should sign in with expiration', async () => {
    const response = await storage.signIn({
      request: fakeRequest(),
      userId: '123',
      expiration: 60,
      redirectTo: '/dashboard',
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/dashboard')

    const cookie = response.headers.get('set-cookie')
    const session = await storage.getSession(fakeRequest(cookie))

    expect(cookie).toBeDefined()
    expect(cookie).toContain('Max-Age=60')
    expect(session.data.userId).toBe('123')
  })

  it('should empty session cookies and data when sign out', async () => {
    const response = await storage.signOut({
      request: fakeRequest(),
      redirectTo: '/sign-in',
    })

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/sign-in')

    const cookie = response.headers.get('set-cookie')
    const session = await storage.getSession(fakeRequest(cookie))

    expect(cookie).toBeDefined()
    expect(session.data.userId).toBeUndefined()
  })

  it('should get the user id', async () => {
    const response = await storage.signIn({
      request: fakeRequest(),
      userId: '123',
      redirectTo: '/',
    })

    const cookie = response.headers.get('set-cookie')
    const userId = await storage.getUserId(fakeRequest(cookie))

    expect(userId).toBe('123')
  })

  it('should throw when user is not signed in', async () => {
    const request = fakeRequest()

    try {
      await storage.getUserIdOrThrow(request)
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).status).toBe(401)
      expect(await (error as Response).text()).toBe('"Unauthorized"')
    }
  })

  it('should get the user id or throw', async () => {
    const response = await storage.signIn({
      request: fakeRequest(),
      userId: '123',
      redirectTo: '/',
    })

    const cookie = response.headers.get('set-cookie')
    const userId = await storage.getUserIdOrThrow(fakeRequest(cookie))

    expect(userId).toBe('123')
  })
})
