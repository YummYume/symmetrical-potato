import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { UserStatusEnum } from '~api/types';

import type { ComponentProps } from 'react';

export type UserStatusBadgeProps = {
  status: UserStatusEnum;
} & ComponentProps<typeof Badge>;

export const UserStatusBadge = ({ status, ...rest }: UserStatusBadgeProps) => {
  const { t } = useTranslation();

  if (status === UserStatusEnum.Verified) {
    return (
      <Badge color="green" size="1" className="h-fit w-fit" {...rest}>
        {t('user.status.verified')}
      </Badge>
    );
  }

  if (status === UserStatusEnum.Unverified) {
    return (
      <Badge color="orange" size="1" className="h-fit w-fit" {...rest}>
        {t('user.status.unverified')}
      </Badge>
    );
  }

  return (
    <Badge color="red" size="1" className="h-fit w-fit" {...rest}>
      {t('user.status.dead')}
    </Badge>
  );
};
