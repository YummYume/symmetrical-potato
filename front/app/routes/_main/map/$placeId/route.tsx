import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getEnv } from '~/lib/utils/env';
import { getUriId } from '~/lib/utils/path';
import { getGoogleLocation, getLocationInfo } from '~api/location';
import { Link } from '~components/Link';
import { hasPathError } from '~utils/api';
import { ROLES, denyAccessUnlessGranted, hasRoles } from '~utils/security.server';

import type { Heist, HeistEdge, Review, ReviewEdge } from '~api/types';

export async function loader({ context, params }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);
  const isContractor = hasRoles(context.user, ROLES.CONTRACTOR);
  const isAdmin = hasRoles(context.user, ROLES.ADMIN);

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

  try {
    const locationInfo = await getLocationInfo(context.client, params.placeId);

    return {
      locale: context.locale,
      locationInfo,
      place: null,
      placeId: params.placeId,
      isContractor,
      isAdmin,
      user: context.user,
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

  if (!place) {
    throw redirect('/map');
  }

  return {
    locale: null,
    locationInfo: null,
    place,
    placeId: params.placeId,
    isContractor,
    isAdmin,
    user: context.user,
  };
}

export type Loader = typeof loader;

type HeistEdgeWithNode = HeistEdge & { node: Heist };
type ReviewEdgeWithNode = ReviewEdge & { node: Review };

export default function PlaceId() {
  const { locationInfo, locale, place, placeId, isContractor, isAdmin, user } =
    useLoaderData<Loader>();
  const { t } = useTranslation();

  const heists =
    locationInfo?.heists?.edges?.filter<HeistEdgeWithNode>(
      (heist): heist is HeistEdgeWithNode => !!heist?.node,
    ) ?? [];

  const reviews =
    locationInfo?.reviews?.edges?.filter<ReviewEdgeWithNode>(
      (review): review is ReviewEdgeWithNode => !!review?.node,
    ) ?? [];

  if (!locationInfo?.location) {
    return (
      place && (
        <>
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
              <Link
                to={`/map/${placeId}/add`}
                className="block w-auto rounded-1 bg-green-10 p-2 text-center font-medium transition-colors hover:bg-green-8"
                unstyled
              >
                {t('heist.add', {
                  ns: 'heist',
                })}
              </Link>
            )}
          </div>
        </>
      )
    );
  }

  return (
    <Grid gap="3">
      <div>
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            {locationInfo.location.name}
          </Heading>
        </Dialog.Title>
        <Section className="space-y-3" size="1">
          <Dialog.Description>{locationInfo.location.address}</Dialog.Description>
          <Text as="p">{locationInfo.location.reviewCount} reviews</Text>

          {locationInfo.location.averageRating && (
            <Text as="p">{locationInfo.location.averageRating} average rating</Text>
          )}
        </Section>
      </div>
      {(isContractor || isAdmin) && (
        <Link
          to={`/map/${placeId}/add`}
          className="block w-auto rounded-1 bg-green-10 p-2 text-center font-medium transition-colors hover:bg-green-8"
          unstyled
        >
          {t('heist.add', {
            ns: 'heist',
          })}
        </Link>
      )}

      {/* TODO tabs ? */}
      {reviews.length > 0 && (
        <div>
          <Heading as="h3" size="8">
            Reviews
          </Heading>
          <div>
            {reviews.map((review) => (
              <Section className="space-y-3" key={review.node.id} size="1">
                <Text as="p">{review.node.user.username}</Text>
                <Text as="p">{review.node.rating}</Text>
                <Text as="p">{review.node.comment}</Text>
                {review.node.createdAt && (
                  <Text as="p">
                    {new Date(review.node.createdAt).toLocaleDateString(locale, {
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                )}
              </Section>
            ))}
          </div>
        </div>
      )}

      {heists.length > 0 && (
        <div>
          <Heading as="h3" size="8">
            {t('heists')}
          </Heading>
          {heists.map((heist) => (
            <Section className="space-y-3" key={heist.node?.id} size="1">
              <div className="flex items-center justify-between">
                <Link className="w-fit" to="/">
                  <Heading as="h3" size="6">
                    {heist.node.name}
                  </Heading>
                </Link>
                {isAdmin ||
                  (isContractor && heist.node.establishment.contractor.id === user?.id && (
                    <div className="flex items-center">
                      <Link
                        to={`/map/${placeId}/${getUriId(heist.node?.id)}/edit`}
                        className="block w-auto rounded-1 bg-blue-10 p-2 text-center font-medium transition-colors hover:bg-blue-8"
                        unstyled
                      >
                        {t('heist.edit', {
                          ns: 'heist',
                        })}
                      </Link>
                      <Link
                        to={`/map/${placeId}/delete`}
                        className="block w-auto rounded-1 bg-red-10 p-2 text-center font-medium transition-colors hover:bg-red-8"
                        unstyled
                      >
                        {t('heist.delete', {
                          ns: 'heist',
                        })}
                      </Link>
                    </div>
                  ))}
              </div>
              <Text as="p" className="underline">
                {new Date(heist.node.startAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text as="p">
                <span className="font-bold">{t('heist.difficulty')}</span>
                {heist.node.difficulty}
              </Text>
              <Text as="p">
                <span className="font-bold">{t('heist.minimum_payout')}</span>
                {Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
                  heist.node.minimumPayout,
                )}
              </Text>
              <Text as="p">
                <span className="font-bold">{t('heist.maximum_payout')}</span>
                {Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
                  heist.node.maximumPayout,
                )}
              </Text>
            </Section>
          ))}
        </div>
      )}
    </Grid>
  );
}
