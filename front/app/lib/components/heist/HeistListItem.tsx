import { Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import dayjs from '~utils/dayjs';

import { HeistPhaseBadge } from './HeistPhaseBadge';

import type { ComponentProps } from 'react';
import type { HeistPhaseEnum } from '~/lib/api/types';

export type HeistListItemProps = {
  name: string;
  crewMembers: number;
  startAt: string;
  locale: string;
  phase: HeistPhaseEnum;
} & ComponentProps<typeof Card>;

export const HeistListItem = ({
  name,
  crewMembers,
  startAt,
  locale,
  phase,
  ...rest
}: HeistListItemProps) => {
  const { t } = useTranslation();
  const heistStartAt = dayjs(startAt).locale(locale);

  return (
    <Card {...rest}>
      <Flex justify="between" gap="1">
        <Flex direction="column" justify="between" gap="1" align="start">
          <Text as="p" size="2" weight="bold">
            {name}
          </Text>
          <Text as="p" color="gray" size="2">
            {heistStartAt.isSameOrAfter(dayjs().locale(locale), 'hours')
              ? heistStartAt.fromNow()
              : heistStartAt.toNow()}
          </Text>
        </Flex>
        <Flex direction="column" justify="between" gap="1" align="end">
          <Text
            as="p"
            size="2"
            weight="bold"
            aria-label={t('heist.crew_member_count', {
              count: crewMembers,
            })}
          >
            {crewMembers}
            <span> / 4</span>
          </Text>
          <HeistPhaseBadge phase={phase} />
        </Flex>
      </Flex>
    </Card>
  );
};
