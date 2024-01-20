import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { AssetTypeEnum } from '~api/types';

import type { ComponentProps } from 'react';

export type AssetTypeBadgeProps = {
  type: AssetTypeEnum;
} & ComponentProps<typeof Badge>;

export const AssetTypeBadge = ({ type, ...rest }: AssetTypeBadgeProps) => {
  const { t } = useTranslation();

  if (type === AssetTypeEnum.Asset) {
    return (
      <Badge color="blue" size="1" className="h-fit" {...rest}>
        {t('asset.type.asset')}
      </Badge>
    );
  }

  if (type === AssetTypeEnum.Equipment) {
    return (
      <Badge color="gold" size="1" className="h-fit" {...rest}>
        {t('asset.type.equipment')}
      </Badge>
    );
  }

  return (
    <Badge color="pink" size="1" className="h-fit" {...rest}>
      {t('asset.type.weapon')}
    </Badge>
  );
};
