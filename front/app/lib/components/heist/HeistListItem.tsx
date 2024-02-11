import { Card, Flex, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import dayjs from '~utils/dayjs';

import { HeistPhaseBadge } from './HeistPhaseBadge';

import type { ComponentProps } from 'react';
import type { HeistPhaseEnum } from '~/lib/api/types';

export type HeistListItemProps = {
  name: string;
  crewMembers?: number;
  startAt: string;
  phase: HeistPhaseEnum;
} & ComponentProps<typeof Card>;

export const HeistListItem = ({
  name,
  crewMembers = 0,
  startAt,
  phase,
  ...rest
}: HeistListItemProps) => {
  const { t, i18n } = useTranslation();
  const heistStartAt = dayjs(startAt).locale(i18n.language);

  return (
    <Card {...rest}>
      <Flex justify="between" gap="1">
        <Flex direction="column" justify="between" gap="1" align="start">
          <Text as="p" size="2" weight="bold">
            {name}
          </Text>
          <Text as="p" color="gray" size="2">
            {heistStartAt.isSameOrAfter(dayjs().locale(i18n.language), 'hours')
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
