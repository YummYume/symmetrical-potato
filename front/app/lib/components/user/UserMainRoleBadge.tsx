import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import type { ComponentProps } from 'react';

export type UserMainRoleBadgeProps = {
  mainRole?: string | null;
} & ComponentProps<typeof Badge>;

export const UserMainRoleBadge = ({ mainRole, ...rest }: UserMainRoleBadgeProps) => {
  const { t } = useTranslation();

  // TODO use enum
  if (mainRole === 'ROLE_HEISTER') {
    return (
      <Badge color="teal" size="1" className="h-fit" {...rest}>
        {t('user.role.heister')}
      </Badge>
    );
  }

  if (mainRole === 'ROLE_EMPLOYEE') {
    return (
      <Badge color="iris" size="1" className="h-fit" {...rest}>
        {t('user.role.employee')}
      </Badge>
    );
  }

  if (mainRole === 'ROLE_CONTRACTOR') {
    return (
      <Badge color="crimson" size="1" className="h-fit" {...rest}>
        {t('user.role.contractor')}
      </Badge>
    );
  }

  return null;
};
