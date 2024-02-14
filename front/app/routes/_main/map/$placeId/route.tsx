import * as Dialog from '@radix-ui/react-dialog';
import { PlusIcon } from '@radix-ui/react-icons';
import { Button, Flex, Grid, Heading, IconButton, Section, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getHeistsByCrewMember } from '~/lib/api/heist';
import Popover from '~/lib/components/Popover';
import { Rating } from '~/lib/components/Rating';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { HeistHoverCard } from '~/lib/components/heist/HeistHoverCard';
import { HeistListItem } from '~/lib/components/heist/HeistListItem';
import { ReviewListItem } from '~/lib/components/review/ReviewListItem';
import { i18next } from '~/lib/i18n/index.server';
import { getEnv } from '~/lib/utils/env';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { getGoogleLocation, getLocationInfo } from '~api/location';
import { type Heist, type HeistEdge, type Review, type ReviewEdge } from '~api/types';
import { Link } from '~components/Link';
import { hasPathError } from '~utils/api';
import { denyAccessUnlessGranted, hasRoles } from '~utils/security.server';

import { FormReview } from '../$placeId_/review/FormReview';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);
  const isContractor = hasRoles(user, ROLES.CONTRACTOR);
  const isHeister = hasRoles(user, ROLES.HEISTER);

  // Will be used to check if the current user is already a crew member of the heist
  let userCrewHeistsId: string[] = [];

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, 'common');

  if (isHeister) {
    const { heists } = await getHeistsByCrewMember(context.client, user.id);

    userCrewHeistsId = heists.edges.map((edge) => edge.node.id);
  }

  try {
    const locationInfo = await getLocationInfo(context.client, params.placeId);

    return {
      locale: context.locale,
      locationInfo,
      place: null,
      placeId: params.placeId,
      userCrewHeistsId,
      isContractor,
      isHeister,
      user,
      meta: {
        title: locationInfo.location.name,
        description: t('meta.location.description', {
          address: locationInfo.location.address,
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'location')) {
      throw e;
    }
  }

  const place = await getGoogleLocation({
    key: getEnv('GOOGLE_MAPS_API_KEY'),
    placeId: params.placeId,
    languageCode: context.locale,
  });

  return {
    locale: null,
    locationInfo: null,
    place,
    placeId: params.placeId,
    userCrewHeistsId,
    isContractor,
    isHeister,
    user,
    meta: {
      title: place?.displayName?.text ?? t('location.not_found'),
      description: t('meta.location.description', {
        address: place?.formattedAddress ?? '',
      }),
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

type HeistEdgeWithNode = HeistEdge & { node: Heist };
type ReviewEdgeWithNode = ReviewEdge & { node: Review };

export default function PlaceId() {
  const { locationInfo, place, placeId, isContractor, user } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const heists =
    locationInfo?.heists?.edges?.filter<HeistEdgeWithNode>(
      (heist): heist is HeistEdgeWithNode => !!heist?.node,
    ) ?? [];
  const reviews =
    locationInfo?.reviews?.edges?.filter<ReviewEdgeWithNode>(
      (review): review is ReviewEdgeWithNode => !!review?.node,
    ) ?? [];

  const userReview = reviews && reviews.find((review) => review.node.user.id === user.id);

  if (!locationInfo?.location) {
    return place ? (
      <div>
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            {place.displayName.text}
          </Heading>
        </Dialog.Title>
        <Section className="space-y-3" size="1">
          <Dialog.Description>{place.formattedAddress}</Dialog.Description>
        </Section>
        {isContractor && (
          <Link to={`/map/${placeId}/heist/add`}>
            <div className="flex h-8 w-fit items-center rounded-2 bg-accent-9 px-3 text-[black]">
              {t('heist.add')}
            </div>
          </Link>
        )}
      </div>
    ) : (
      <Dialog.Title asChild>
        <Heading as="h2" size="8">
          {t('location.not_found')}
        </Heading>
      </Dialog.Title>
    );
  }

  return (
    <Grid>
      <Section className="space-y-2" size="1">
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            {locationInfo.location.name}
          </Heading>
        </Dialog.Title>

        <Dialog.Description>{locationInfo.location.address}</Dialog.Description>

        {!!locationInfo.location.averageRating && (
          <Flex align="center" gap="1">
            <Rating
              readOnly
              style={{ maxWidth: 150 }}
              value={locationInfo.location.averageRating}
            />
            <span>
              ({t('location.reviews_count', { count: locationInfo.location.reviewCount })})
            </span>
          </Flex>
        )}
      </Section>

      <Section className="grid gap-2" size="1">
        <Flex gap="2" align="center">
          <Heading as="h3" size="8">
            {t('heists')}
          </Heading>

          {isContractor && (
            <IconButton aria-label={t('heist.add')}>
              <Link to={`/map/${placeId}/heist/add`} unstyled>
                <PlusIcon />
              </Link>
            </IconButton>
          )}
        </Flex>

        {heists.length === 0 && (
          <Text as="p" color="gray">
            {t('location.heists_count', { count: 0 })}
          </Text>
        )}

        {heists.length > 0 && (
          <ul className="space-y-2">
            {heists.map(({ node }) => (
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
                    id: locationInfo.location.placeId,
                    name: locationInfo.location.name,
                  }}
                  establishment={{
                    id: node.establishment.id,
                    name: node.establishment.name,
                  }}
                  align="end"
                >
                  <Link to={`/map/${locationInfo.location.placeId}/heist/${getUriId(node.id)}`}>
                    <HeistListItem
                      name={node.name}
                      crewMembers={node.crewMembers.totalCount}
                      startAt={node.startAt}
                      phase={node.phase}
                    />
                  </Link>
                </HeistHoverCard>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section className="space-y-2" size="1">
        <Heading as="h3" size="8">
          Reviews
        </Heading>

        {reviews.length === 0 && (
          <Text as="p" color="gray">
            {t('location.reviews_count', { count: 0 })}
          </Text>
        )}

        <Flex direction={{ initial: 'column', sm: 'row' }} gap="2" align="center">
          <Popover triggerChildren={userReview ? t('review.edit_review') : t('review.add_review')}>
            <FormReview review={userReview} placeId={placeId} />
          </Popover>
          {userReview && (
            <FormConfirmDialog
              formId="review-delete"
              title={t('delete')}
              description={t('review.delete.confirm')}
              action={`/map/${placeId}/review/${getUriId(userReview?.node.id)}/delete`}
              actionColor="green"
            >
              <Button type="button" color="tomato" variant="soft">
                {t('delete')}
              </Button>
            </FormConfirmDialog>
          )}
        </Flex>

        {reviews.length > 0 && (
          <ul className="space-y-2">
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
      </Section>
    </Grid>
  );
}
