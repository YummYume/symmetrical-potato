import { redirect } from '@remix-run/node';

import type { MeUser } from '~api/types';

/**
 * Throw a redirect if the user is not logged in. Will return the user if logged in.
 */
export const denyAccessUnlessGranted = (
  user: MeUser | null,
  roles: string | string[] = 'ROLE_USER',
  redirectTo = '/login',
  init: number | ResponseInit | undefined = undefined,
) => {
  const securityRoles = Array.isArray(roles) ? roles : [roles];

  if (!user || !user.roles.some((role: string) => securityRoles.includes(role))) {
    throw redirect(redirectTo, init);
  }

  return user;
};
