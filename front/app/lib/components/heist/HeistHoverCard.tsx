import { Box, Flex, Grid, Heading, HoverCard, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';

import { getUriId } from '~/lib/utils/path';
import { truncate } from '~/lib/utils/string';
import dayjs from '~utils/dayjs';

import { HeistDifficultyBadge } from './HeistDifficultyBadge';
import { HeistPhaseBadge } from './HeistPhaseBadge';
import { HeistPreferedTacticBadge } from './HeistPreferedTacticBadge';

import { Link } from '../Link';

import type { ComponentProps } from 'react';
import type { HeistDifficultyEnum, HeistPhaseEnum, HeistPreferedTacticEnum } from '~/lib/api/types';

export type HeistHoverCardProps = {
  name: string;
  description?: string;
  startAt?: string;
  shouldEndAt?: string;
  minimumPayout?: number;
  maximumPayout?: number;
  objectiveCount?: number;
  heistersCount?: number;
  phase?: HeistPhaseEnum;
  preferedTactic?: HeistPreferedTacticEnum;
  difficulty?: HeistDifficultyEnum;
  location?: {
    id: string;
    name: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
  children?: JSX.Element;
} & ComponentProps<typeof HoverCard.Content>;

export const HeistHoverCard = ({
  name,
  description,
  startAt,
  shouldEndAt,
  minimumPayout,
  maximumPayout,
  objectiveCount,
  heistersCount,
  phase,
  preferedTactic,
  difficulty,
  location,
  establishment,
  children,
  ...rest
}: HeistHoverCardProps) => {
  const { t, i18n } = useTranslation();

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>{children}</HoverCard.Trigger>
      <HoverCard.Content
        side="top"
        align="center"
        style={{ minWidth: 350, maxWidth: 400 }}
        {...rest}
      >
        <Box>
          <Flex
            direction={{ initial: 'column', sm: 'row' }}
            gap="2"
            align="start"
            justify="between"
          >
            <Heading size="3" as="h2">
              {name}
            </Heading>

            <Flex direction={{ initial: 'column', sm: 'row' }} gap="1" align="end">
              {phase && <HeistPhaseBadge phase={phase} />}
              {difficulty && <HeistDifficultyBadge difficulty={difficulty} />}
              {preferedTactic && <HeistPreferedTacticBadge preferedTactic={preferedTactic} />}
            </Flex>
          </Flex>

          {(establishment || location) && (
            <Flex gap="1" align="center" mt="1">
              {establishment && (
                <Link to={`/establishments/${getUriId(establishment.id)}`}>
                  {establishment.name}
                </Link>
              )}
              {establishment && location && <Separator orientation="vertical" />}
              {location && <Link to={`/map/${location.id}`}>{location.name}</Link>}
            </Flex>
          )}

          <Text as="p" size="2" mt="3">
            {description ? truncate(description, 150) : t('heist.no_description')}
          </Text>

          {(startAt || shouldEndAt) && (
            <Grid columns="2" gap="2" mt="3">
              {startAt && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.start_at')}
                  </Text>
                  <Text color="gray" size="2">
                    {dayjs(startAt).locale(i18n.language).format('LLL')}
                  </Text>
                </Flex>
              )}
              {shouldEndAt && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.should_end_at')}
                  </Text>
                  <Text color="gray" size="2">
                    {dayjs(shouldEndAt).locale(i18n.language).format('LLL')}
                  </Text>
                </Flex>
              )}
            </Grid>
          )}

          {(minimumPayout || maximumPayout) && (
            <Grid columns="2" gap="2" mt="3">
              {minimumPayout && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.minimum_payout')}
                  </Text>
                  <Text color="gray" size="2">
                    {new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    }).format(minimumPayout)}
                  </Text>
                </Flex>
              )}
              {maximumPayout && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.maximum_payout')}
                  </Text>
                  <Text color="gray" size="2">
                    {new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: 'USD',
                    }).format(maximumPayout)}
                  </Text>
                </Flex>
              )}
            </Grid>
          )}

          {(heistersCount !== undefined || objectiveCount !== undefined) && (
            <Grid columns="2" gap="2" mt="3">
              {heistersCount !== undefined && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.crew_members')}
                  </Text>
                  <Text
                    size="2"
                    color="gray"
                    aria-label={t('heist.crew_member_count', {
                      count: heistersCount,
                    })}
                  >
                    {heistersCount}
                    <span> / 4</span>
                  </Text>
                </Flex>
              )}
              {objectiveCount !== undefined && (
                <Flex direction="column">
                  <Text weight="bold" size="3" color="gray">
                    {t('heist.objective')}
                  </Text>
                  <Text size="2" color="gray">
                    {t('heist.objective_count', {
                      count: objectiveCount,
                    })}
                  </Text>
                </Flex>
              )}
            </Grid>
          )}
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  );
};
