import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getEnv } from '~/lib/utils/env';
import { getGoogleLocation, getLocationInfo } from '~api/location';
import { Link } from '~components/Link';
import { hasPathError } from '~utils/api';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { Heist, HeistEdge, Review, ReviewEdge } from '~api/types';

export async function loader({ context, params }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

  try {
    const locationInfo = await getLocationInfo(context.client, params.placeId);

    return {
      locale: context.locale,
      locationInfo,
      place: null,
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
  };
}

export type Loader = typeof loader;

type HeistEdgeWithNode = HeistEdge & { node: Heist };
type ReviewEdgeWithNode = ReviewEdge & { node: Review };

export default function PlaceId() {
  const { locationInfo, locale, place } = useLoaderData<Loader>();
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
        <div>
          <Dialog.Title asChild>
            <Heading as="h2" size="8">
              {place?.displayName.text}
            </Heading>
          </Dialog.Title>
          <Section className="space-y-3" size="1">
            <Dialog.Description>{place.formattedAddress}</Dialog.Description>
          </Section>
        </div>
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
            {t('common.heists')}
          </Heading>
          {heists.map((heist) => (
            <Section className="space-y-3" key={heist.node?.id} size="1">
              <Link className="w-fit" to="/">
                <Heading as="h3" size="6">
                  {heist.node.name}
                </Heading>
              </Link>
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
                <span className="font-bold">{t('common.difficulty')}</span>
                {heist.node.difficulty}
              </Text>
              <Text as="p">
                <span className="font-bold">{t('common.minimumPayout')}</span>
                {Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
                  heist.node.minimumPayout,
                )}
              </Text>
              <Text as="p">
                <span className="font-bold">{t('common.maximumPayout')}</span>
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
