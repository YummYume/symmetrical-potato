import { Avatar } from '@radix-ui/themes';

import { ROLES } from '~/lib/utils/roles';

import type { ComponentProps } from 'react';

export type UserAvatarProps = {
  username: string;
  mainRole?: string | null;
} & Omit<ComponentProps<typeof Avatar>, 'fallback'>;

export const UserAvatar = ({ username, mainRole, ...rest }: UserAvatarProps) => {
  const fallback = username.at(0);

  if (!fallback) {
    return null;
  }

  let color: (typeof rest)['color'] = undefined;

  if (mainRole === ROLES.HEISTER) {
    color = 'teal';
  } else if (mainRole === ROLES.EMPLOYEE) {
    color = 'iris';
  } else if (mainRole === ROLES.CONTRACTOR) {
    color = 'ruby';
  }

  return <Avatar aria-hidden="true" variant="solid" color={color} {...rest} fallback={fallback} />;
};
