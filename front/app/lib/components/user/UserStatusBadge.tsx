import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { UserStatusEnum } from '~api/types';

export type UserStatusBadgeProps = {
  status: UserStatusEnum;
} & React.ComponentProps<typeof Badge>;

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const { t } = useTranslation();

  if (status === UserStatusEnum.Verified) {
    return <Badge color="green">{t('user.status.verified')}</Badge>;
  }

  if (status === UserStatusEnum.Unverified) {
    return <Badge color="orange">{t('user.status.unverified')}</Badge>;
  }

  return <Badge color="red">{t('user.status.dead')}</Badge>;
};
