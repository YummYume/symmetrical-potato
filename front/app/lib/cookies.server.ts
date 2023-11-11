import { createCookie } from '@remix-run/node';

export const AUTHORIZATION_COOKIE_NAME = 'BEARER' as const;
export const AUTHORIZATION_COOKIE_PREFIX = 'Bearer' as const;
export const LOCALE_COOKIE_NAME = 'LOCALE' as const;
export const DARK_MODE_COOKIE_NAME = 'DARK_MODE' as const;

/**
 * Generic function to get a cookie from a cookie string.
 */
export const getCookie = (cookies: string, name: string) => {
  const cookie = cookies.split('; ').find((cookie) => cookie.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return cookie.split('=')[1];
};

/**
 * Bearer cookie for storing the JWT token.
 */
export const bearerCookie = createCookie(AUTHORIZATION_COOKIE_NAME, {
  httpOnly: true,
  path: process.env.SITE_HOST ?? '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 604_800, // one week
});

/**
 * Parse the bearer cookie from the request.
 */
export const parseBearerCookie = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie');

  return (await bearerCookie.parse(cookieHeader)) || '';
};

/**
 * Locale cookie for storing the user's locale.
 */
export const localeCookie = createCookie(LOCALE_COOKIE_NAME, {
  httpOnly: true,
  path: process.env.SITE_HOST ?? '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

/**
 * Parse the locale cookie from the request.
 */
export const parseLocaleCookie = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie');

  return (await localeCookie.parse(cookieHeader)) || '';
};

/**
 * Dark mode cookie for storing the user's dark mode preference.
 */
export const darkModeCookie = createCookie(DARK_MODE_COOKIE_NAME, {
  httpOnly: false,
  path: process.env.SITE_HOST ?? '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});

/**
 * Parse the dark mode cookie from the request.
 */
export const parseDarkModeCookie = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie');

  return (await darkModeCookie.parse(cookieHeader)) || '';
};
