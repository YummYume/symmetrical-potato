import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { ContractorRequestStatusEnum } from '~api/types';

import type { ComponentProps } from 'react';

export type ContractorRequestStatusBadgeProps = {
  status: ContractorRequestStatusEnum;
} & ComponentProps<typeof Badge>;

export const ContractorRequestStatusBadge = ({
  status,
  ...rest
}: ContractorRequestStatusBadgeProps) => {
  const { t } = useTranslation();

  if (status === ContractorRequestStatusEnum.Accepted) {
    return (
      <Badge color="green" size="1" className="h-fit" {...rest}>
        {t('contractor_request.status.accepted')}
      </Badge>
    );
  }

  if (status === ContractorRequestStatusEnum.Rejected) {
    return (
      <Badge color="red" size="1" className="h-fit" {...rest}>
        {t('contractor_request.status.rejected')}
      </Badge>
    );
  }

  return (
    <Badge color="gray" size="1" className="h-fit" {...rest}>
      {t('contractor_request.status.pending')}
    </Badge>
  );
};
