import { createCookie } from '@remix-run/node';

export const AUTHORIZATION_COOKIE_NAME = 'Authorization' as const;
export const AUTHORIZATION_COOKIE_PREFIX = 'Bearer ' as const;

export const bearerCookie = createCookie(AUTHORIZATION_COOKIE_NAME, {
  httpOnly: true,
  path: process.env.SITE_HOST ?? '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 604_800, // one week
});

export const parseBearerCookie = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie');

  return (await bearerCookie.parse(cookieHeader)) || {};
};
