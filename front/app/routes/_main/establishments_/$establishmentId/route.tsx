import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Box, Button, Card, Container, Flex, Heading, Tabs, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getEmployeesEstablishments } from '~/lib/api/employee';
import { getEstablishment } from '~/lib/api/establishment';
import { getHeistsForEstablishment } from '~/lib/api/heist';
import { getReviewsForEstablishment } from '~/lib/api/review';
import { EmployeeStatusEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import Popover from '~/lib/components/Popover';
import { Rating } from '~/lib/components/Rating';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
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
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';

import { FormReview } from '../$establishmentId_/review/FormReview';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import type { ReviewEdge } from '~/lib/api/types';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

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

    return {
      userReview: reviews.edges.find((review) => review.node.user.id === user.id),
      canApply: hasRoles(user, [ROLES.HEISTER]) && !user.employee,
      establishment,
      heists: heists.edges,
      reviews: reviews.edges,
      employees: employees.edges.filter(({ node }) => node.status === EmployeeStatusEnum.Active),
      meta: {
        title: establishment.name,
        description: t('meta.establishment.description', {
          name: establishment.name,
        }),
      },
    };
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

export default function Establishment() {
  const { t } = useTranslation();
  const { canApply, establishment, heists, reviews, employees, userReview } =
    useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {establishment.name}
          </Heading>

          <Flex direction="column" gap="3">
            <div>
              <Link className="flex items-center gap-1 pb-1 pl-2" to="/establishments">
                <span aria-hidden="true">
                  <ArrowLeftIcon width="20" height="20" />
                </span>
                {t('back')}
              </Link>
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
                        <Rating
                          style={{ width: 125 }}
                          value={establishment.averageRating}
                          readOnly
                        />
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
            </div>

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
                                <Link
                                  to={`/map/${node.location.placeId}/heist/${getUriId(node.id)}`}
                                >
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
                  <Flex mb="2" justify="end" gap="2">
                    <Popover
                      triggerChildren={
                        userReview ? t('review.edit_review') : t('review.add_review')
                      }
                    >
                      <FormReview
                        review={userReview as ReviewEdge | undefined}
                        establishmentId={establishment.id}
                      />
                    </Popover>
                    {userReview && (
                      <FormConfirmDialog
                        formId="review-delete"
                        title={t('delete')}
                        description={t('review.delete.confirm')}
                        action={`/establishments/${getUriId(establishment.id)}/review/${getUriId(userReview?.node.id)}/delete`}
                        actionColor="green"
                      >
                        <Button type="button" color="tomato" variant="soft">
                          {t('delete')}
                        </Button>
                      </FormConfirmDialog>
                    )}
                  </Flex>

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
                                description: node.user.profile?.description,
                                globalRating: node.user.globalRating,
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
                  {canApply && (
                    <Flex mb="2" justify="end">
                      <Link to="apply">Apply</Link>
                    </Flex>
                  )}

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
                                description: node.user.profile?.description,
                                globalRating: node.user.globalRating,
                              }}
                              codeName={node.codeName}
                              description={node.description}
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
