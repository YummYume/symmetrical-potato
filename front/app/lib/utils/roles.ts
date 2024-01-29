type RolesKey = 'ADMIN' | 'USER' | 'HEISTER' | 'CONTRACTOR' | 'EMPLOYEE';

type Roles = {
  [key in RolesKey]: `ROLE_${key}`;
};

export type Role = Roles[keyof Roles];

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  HEISTER: 'ROLE_HEISTER',
  CONTRACTOR: 'ROLE_CONTRACTOR',
  EMPLOYEE: 'ROLE_EMPLOYEE',
} as const;
