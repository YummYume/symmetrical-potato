import { Avatar } from '@radix-ui/themes';

import type { ComponentProps } from 'react';

export type UserAvatarProps = {
  name: string;
} & Omit<ComponentProps<typeof Avatar>, 'fallback'>;

export const EstablishmentAvatar = ({ name, ...rest }: UserAvatarProps) => {
  const fallback = name.at(0);

  if (!fallback) {
    return null;
  }

  return <Avatar aria-hidden="true" variant="solid" color="brown" {...rest} fallback={fallback} />;
};
