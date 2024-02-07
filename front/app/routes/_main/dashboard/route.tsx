import { Card, Container, Flex, Heading, Section, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { getHeistsForToday } from '~/lib/api/heist';
import { HeistPhaseBadge } from '~/lib/components/heist/HeistPhaseBadge';
import { i18next } from '~/lib/i18n/index.server';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { Link } from '~components/Link';
import dayjs from '~utils/dayjs';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, 'common');
  const response = await getHeistsForToday(context.client);

  return {
    heists: response.heists.edges,
    locale: context.locale,
    pageInfo: response.heists.pageInfo,
    meta: {
      title: t('meta.dashboard.title'),
      description: t('meta.dashboard.description'),
    },
  };
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { heists, locale } = useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Heading align="center" as="h1" size="9">
          {t('dashboard')}
        </Heading>
        <Section className="space-y-3">
          <Heading as="h2" size="6">
            {t('dashboard.heists.today')}
          </Heading>
          {heists.length === 0 && (
            <Text as="p" size="2" color="gray">
              {t('dashboard.heists.no_heists_today')}
            </Text>
          )}
          {heists.length > 0 && (
            <ul className="space-y-3">
              {heists.map(({ node: { crewMembers, id, name, startAt, phase, location } }) => {
                const heistStartAt = dayjs(startAt).locale(locale);

                return (
                  <Card asChild key={id}>
                    <li>
                      {/* TODO heist page */}
                      <Link to={`/map/${location.placeId}`}>
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
                                count: crewMembers.totalCount,
                              })}
                            >
                              {crewMembers.totalCount}
                              <span> / 4</span>
                            </Text>
                            <HeistPhaseBadge phase={phase} />
                          </Flex>
                        </Flex>
                      </Link>
                    </li>
                  </Card>
                );
              })}
            </ul>
          )}
        </Section>
      </Container>
    </main>
  );
}
