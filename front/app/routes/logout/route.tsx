import { redirect } from '@remix-run/node';

import { bearerCookie } from '~/lib/cookies.server';

export const action = async () => {
  // TODO: Revoke refresh token

  throw redirect('/login', {
    headers: {
      'Set-Cookie': await bearerCookie.serialize('', {
        expires: new Date(0),
      }),
    },
  });
};

export type Action = typeof action;
