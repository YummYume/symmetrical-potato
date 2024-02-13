import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { ROLES } from '~/lib/utils/roles';

import type { ComponentProps } from 'react';

export type UserMainRoleBadgeProps = {
  mainRole?: string | null;
} & ComponentProps<typeof Badge>;

export const UserMainRoleBadge = ({ mainRole, ...rest }: UserMainRoleBadgeProps) => {
  const { t } = useTranslation();

  if (mainRole === ROLES.HEISTER) {
    return (
      <Badge color="teal" size="1" className="h-fit w-fit" {...rest}>
        {t('user.role.heister')}
      </Badge>
    );
  }

  if (mainRole === ROLES.EMPLOYEE) {
    return (
      <Badge color="iris" size="1" className="h-fit w-fit" {...rest}>
        {t('user.role.employee')}
      </Badge>
    );
  }

  if (mainRole === ROLES.CONTRACTOR) {
    return (
      <Badge color="ruby" size="1" className="h-fit w-fit" {...rest}>
        {t('user.role.contractor')}
      </Badge>
    );
  }

  return null;
};
