import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { HeistPreferedTacticEnum } from '~/lib/api/types';

import type { ComponentProps } from 'react';

export type HeistPreferedTacticBadgeProps = {
  preferedTactic: HeistPreferedTacticEnum;
} & ComponentProps<typeof Badge>;

export const HeistPreferedTacticBadge = ({
  preferedTactic,
  ...rest
}: HeistPreferedTacticBadgeProps) => {
  const { t } = useTranslation();

  if (preferedTactic === HeistPreferedTacticEnum.Loud) {
    return (
      <Badge color="ruby" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.prefered_tactic')} :</span>{' '}
        {t('heist.prefered_tactic.loud')}
      </Badge>
    );
  }

  if (preferedTactic === HeistPreferedTacticEnum.Stealth) {
    return (
      <Badge color="sky" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.prefered_tactic')} :</span>{' '}
        {t('heist.prefered_tactic.stealth')}
      </Badge>
    );
  }

  if (preferedTactic === HeistPreferedTacticEnum.SemiStealth) {
    return (
      <Badge color="mint" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.prefered_tactic')} :</span>{' '}
        {t('heist.prefered_tactic.semistealth')}
      </Badge>
    );
  }

  return null;
};
