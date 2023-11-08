import { redirect } from '@remix-run/node';

import type { User } from '~api/types';

export const denyAccessUnlessGranted = (
  user: User | null,
  roles: string | string[] = 'ROLE_USER',
  redirectTo = '/login',
  init: number | ResponseInit | undefined = undefined,
) => {
  const securityRoles = Array.isArray(roles) ? roles : [roles];

  if (!user || !user.roles.some((role: string) => securityRoles.includes(role))) {
    throw redirect(redirectTo, init);
  }
};
