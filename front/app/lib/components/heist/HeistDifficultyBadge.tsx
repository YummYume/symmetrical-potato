import { Badge } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { HeistDifficultyEnum } from '~/lib/api/types';

import type { ComponentProps } from 'react';

export type HeistDifficultyBadgeProps = {
  difficulty: HeistDifficultyEnum;
} & ComponentProps<typeof Badge>;

export const HeistDifficultyBadge = ({ difficulty, ...rest }: HeistDifficultyBadgeProps) => {
  const { t } = useTranslation();

  if (difficulty === HeistDifficultyEnum.Overkill) {
    return (
      <Badge color="gold" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.difficulty')} :</span> {t('heist.difficulty.overkill')}
      </Badge>
    );
  }

  if (difficulty === HeistDifficultyEnum.VeryHard) {
    return (
      <Badge color="orange" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.difficulty')} :</span> {t('heist.difficulty.veryhard')}
      </Badge>
    );
  }

  if (difficulty === HeistDifficultyEnum.Hard) {
    return (
      <Badge color="brown" size="1" className="h-fit w-fit" {...rest}>
        <span className="sr-only">{t('heist.difficulty')} :</span> {t('heist.difficulty.hard')}
      </Badge>
    );
  }

  return (
    <Badge color="gray" size="1" className="h-fit w-fit" {...rest}>
      <span className="sr-only">{t('heist.difficulty')} :</span> {t('heist.difficulty.normal')}
    </Badge>
  );
};
