import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { HeistPhaseEnum } from '~/lib/api/types';

import type { ComponentProps } from 'react';

export type HeistPhaseBadgeProps = {
  phase: HeistPhaseEnum;
} & ComponentProps<typeof Badge>;

export const HeistPhaseBadge = ({ phase, ...rest }: HeistPhaseBadgeProps) => {
  const { t } = useTranslation();

  if (phase === HeistPhaseEnum.Cancelled) {
    return (
      <Badge color="gray" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.phase')} :</span> {t('heist.phase.cancelled')}
      </Badge>
    );
  }

  if (phase === HeistPhaseEnum.Failed) {
    return (
      <Badge color="red" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.phase')} :</span> {t('heist.phase.failed')}
      </Badge>
    );
  }

  if (phase === HeistPhaseEnum.InProgress) {
    return (
      <Badge color="gold" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.phase')} :</span> {t('heist.phase.in_progress')}
      </Badge>
    );
  }

  if (phase === HeistPhaseEnum.Succeeded) {
    return (
      <Badge color="green" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.phase')} :</span> {t('heist.phase.succeeded')}
      </Badge>
    );
  }

  return (
    <Badge color="sky" size="1" className="h-fit w-fit" {...rest}>
      <span className="sr-only">{t('heist.phase')} :</span> {t('heist.phase.planning')}
    </Badge>
  );
};
