import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { unauthorized } from './responses'

type Config = {
  sessionSecret: string
  userSessionKey: string
}

export function createAuthStorage({ sessionSecret, userSessionKey }: Config) {
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [sessionSecret],
      secure: process.env.NODE_ENV === 'production',
    },
  })

  async function getSession(request: Request) {
    const cookie = request.headers.get('Cookie')
    return sessionStorage.getSession(cookie)
  }

  async function signIn({
    request,
    userId,
    expiration,
    redirectTo,
  }: {
    request: Request
    userId: string
    expiration?: number | undefined
    redirectTo: string
  }) {
    const session = await getSession(request)

    session.set(userSessionKey, userId)

    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session, { maxAge: expiration }),
      },
    })
  }

  async function signOut({ request, redirectTo }: { request: Request; redirectTo: string }) {
    const session = await getSession(request)

    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    })
  }

  async function getUserId(request: Request): Promise<string | undefined> {
    const session = await getSession(request)
    return session.get(userSessionKey)
  }

  async function getUserIdOrThrow(request: Request) {
    const userId = await getUserId(request)
    if (!userId) throw unauthorized('Unauthorized')
    return userId
  }

  return {
    getSession,
    signIn,
    signOut,
    getUserId,
    getUserIdOrThrow,
  }
}
