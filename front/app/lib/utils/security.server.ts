import { redirect } from '@remix-run/node';

import { ROLES } from './roles';

import type { Role } from './roles';
import type { MeUser } from '~api/types';

/**
 * Throw a redirect if the user is not logged in. Will return the user if logged in.
 */
export const denyAccessUnlessGranted = (
  user: MeUser | null,
  roles: Role | Role[] = ROLES.USER,
  redirectTo = '/login',
  init: number | ResponseInit | undefined = undefined,
): MeUser | never => {
  const securityRoles = Array.isArray(roles) ? roles : [roles];

  if (!user || !user.roles.some((role: Role) => securityRoles.includes(role))) {
    throw redirect(redirectTo, init);
  }

  return user;
};

/**
 * Throw a redirect if the user is not an admin. Will return the user if they are an admin.
 */
export const denyAdminAccessUnlessGranted = (
  user: MeUser | null,
  redirectTo = '/dashboard',
  init: number | ResponseInit | undefined = undefined,
) => denyAccessUnlessGranted(user, ROLES.ADMIN, redirectTo, init);

/**
 * Check if the user has the given roles.
 */
export const hasRoles = (user: MeUser | null, roles: Role | Role[] = ROLES.USER): boolean => {
  const securityRoles = Array.isArray(roles) ? roles : [roles];

  return user && user.roles.some((role: Role) => securityRoles.includes(role));
};
