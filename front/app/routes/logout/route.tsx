import { type LoaderFunctionArgs, redirect } from '@remix-run/node';

import { revokeRefreshToken } from '~/lib/api/user';
import { bearerCookie, refreshTokenCookie } from '~/lib/cookies.server';

export const action = async ({ context, request }: LoaderFunctionArgs) => {
  if (!context.user) {
    throw redirect('/');
  }

  const refreshToken = await refreshTokenCookie.parse(request.headers.get('Cookie') ?? '');

  if (refreshToken) {
    try {
      await revokeRefreshToken(context.client, refreshToken);
    } catch (error) {
      // It doesn't matter if the refresh token is revoked or not.
    }
  }

  const headers = new Headers();

  headers.append(
    'Set-Cookie',
    await bearerCookie.serialize('', {
      expires: new Date(0),
    }),
  );
  headers.append(
    'Set-Cookie',
    await refreshTokenCookie.serialize('', {
      expires: new Date(0),
    }),
  );

  throw redirect('/login', {
    headers,
  });
};

export type Action = typeof action;
