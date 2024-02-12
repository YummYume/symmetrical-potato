import { Box, Card, Container, Flex, Heading, Tabs, Text } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishment } from '~/lib/api/establishment';
import { getHeistsForEstablishment } from '~/lib/api/heist';
import { getReviewsForEstablishment } from '~/lib/api/review';
import { Link } from '~/lib/components/Link';
import { Rating } from '~/lib/components/Rating';
import { EmployeeListItem } from '~/lib/components/employee/EmployeeListItem';
import { EstablishmentAvatar } from '~/lib/components/establishment/EstablishmentAvatar';
import { HeistHoverCard } from '~/lib/components/heist/HeistHoverCard';
import { HeistListItem } from '~/lib/components/heist/HeistListItem';
import { ReviewListItem } from '~/lib/components/review/ReviewListItem';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import dayjs from '~/lib/utils/dayjs';
import { getUriId } from '~/lib/utils/path';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.establishmentId) {
    throw new Response(null, {
      status: 404,
      statusText: 'establishment.not_found',
    });
  }

  try {
    const [{ establishment }, { heists }, { reviews }, { employees }] = await Promise.all([
      getEstablishment(context.client, params.establishmentId),
      getHeistsForEstablishment(context.client, params.establishmentId),
      getReviewsForEstablishment(context.client, params.establishmentId),
      getEmployeesEstablishments(context.client, [params.establishmentId]),
    ]);
    const t = await i18next.getFixedT(request, 'common');

    return json({
      establishment,
      heists: heists.edges,
      reviews: reviews.edges,
      employees: employees.edges,
      meta: {
        title: establishment.name,
        description: t('meta.establishment.description', {
          name: establishment.name,
        }),
      },
    });
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'user')) {
      throw e;
    }
  }

  throw new Response(null, {
    status: 404,
    statusText: 'establishment.not_found',
  });
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

export default function Profile() {
  const { t } = useTranslation();
  const { establishment, heists, reviews, employees } = useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {establishment.name}
          </Heading>

          <Flex direction="column" gap="3">
            <Card>
              <Flex
                direction={{ initial: 'column', md: 'row' }}
                gap={{ initial: '2', md: '4' }}
                className="p-2 md:p-0"
              >
                <Flex direction="row" gap={{ initial: '1', md: '2' }} className="grow">
                  <Flex direction="column" gap="2" align="center">
                    <EstablishmentAvatar name={establishment.name} size="6" />
                  </Flex>
                  <Text as="p" size="5">
                    {establishment.description ?? t('user.no_description')}
                  </Text>
                </Flex>
                <Flex align="end" justify="between" gap="2" direction="column">
                  {establishment.averageRating ? (
                    <Flex direction="column" gap="1" align="end">
                      <Text as="span" weight="bold" size="2">
                        {t('user.global_rating')}
                      </Text>
                      <Rating style={{ width: 125 }} value={establishment.averageRating} readOnly />
                    </Flex>
                  ) : (
                    <div />
                  )}
                  <Flex direction="column" gap="1" align="end">
                    <Text align="right" className="w-full" weight="bold" size="2">
                      {t('contractor')}
                    </Text>
                    <UserHoverCard
                      username={establishment.contractor.username}
                      description={establishment.contractor.profile.description}
                      mainRole={establishment.contractor.mainRole}
                      globalRating={establishment.contractor.globalRating}
                    >
                      <Link to={`/profile/${getUriId(establishment.contractor.id)}`}>
                        {establishment.contractor.username}
                      </Link>
                    </UserHoverCard>
                  </Flex>
                </Flex>
              </Flex>
            </Card>

            <Tabs.Root defaultValue="heists">
              <Tabs.List>
                <Tabs.Trigger value="heists">
                  {t('heists')} ({heists.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="reviews">
                  {t('reviews')} ({reviews.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="employees">
                  {t('employees')} ({employees.length})
                </Tabs.Trigger>
              </Tabs.List>

              <Box px="4" pt="3" pb="2">
                <Tabs.Content value="heists">
                  {heists.length === 0 && (
                    <Text as="p" size="2" color="gray">
                      {t('establishment.no_heists')}
                    </Text>
                  )}

                  {heists.length > 0 && (
                    <ul className="space-y-3">
                      {heists
                        .sort((a, b) => -dayjs(a.node.startAt).diff(dayjs(b.node.startAt)))
                        .map(({ node }) => {
                          return (
                            <li key={node.id}>
                              <HeistHoverCard
                                name={node.name}
                                description={node.description}
                                startAt={node.startAt}
                                shouldEndAt={node.shouldEndAt}
                                minimumPayout={node.minimumPayout}
                                maximumPayout={node.maximumPayout}
                                objectiveCount={node.objectives.length}
                                heistersCount={node.crewMembers.totalCount}
                                phase={node.phase}
                                preferedTactic={node.preferedTactic}
                                difficulty={node.difficulty}
                                location={{
                                  id: node.location.placeId,
                                  name: node.location.name,
                                }}
                                establishment={{
                                  id: node.establishment.id,
                                  name: node.establishment.name,
                                }}
                                align="end"
                              >
                                {/* TODO heist page */}
                                <Link to={`/map/${node.location.placeId}`}>
                                  <HeistListItem
                                    name={node.name}
                                    crewMembers={node.crewMembers.totalCount}
                                    startAt={node.startAt}
                                    phase={node.phase}
                                  />
                                </Link>
                              </HeistHoverCard>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </Tabs.Content>

                <Tabs.Content value="reviews">
                  {reviews.length === 0 && (
                    <Text as="p" size="2" color="gray">
                      {t('establishment.no_reviews')}
                    </Text>
                  )}

                  {reviews.length > 0 && (
                    <ul className="space-y-3">
                      {reviews.map(({ node }) => {
                        return (
                          <li key={node.id}>
                            <ReviewListItem
                              user={{
                                id: node.user.id,
                                mainRole: node.user.mainRole,
                                username: node.user.username,
                              }}
                              rating={node.ratingNumber}
                              comment={node.comment}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Tabs.Content>

                <Tabs.Content value="employees">
                  {employees.length === 0 && (
                    <Text as="p" size="2" color="gray">
                      {t('establishment.no_employees')}
                    </Text>
                  )}

                  {employees.length > 0 && (
                    <ul className="space-y-3">
                      {employees.map(({ node }) => {
                        return (
                          <li key={node.id}>
                            <EmployeeListItem
                              user={{
                                id: node.user.id,
                                mainRole: node.user.mainRole,
                                username: node.user.username,
                              }}
                              codeName={node.codeName}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Flex>
        </Flex>
      </Container>
    </main>
  );
}
