import { createCookieSessionStorage } from '@remix-run/node';

export const SESSION_COOKIE_NAME = '__session' as const;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: SESSION_COOKIE_NAME,
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET ?? ''],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
