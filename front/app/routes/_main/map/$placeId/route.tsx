import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type DataFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getLocationInfo } from '~api/location';
import { Link } from '~components/Link';
import { hasPathError } from '~utils/api';
import { denyAccessUnlessGranted } from '~utils/security.server';

import type { HeistEdge, Heist, Review, ReviewEdge } from '~api/types';

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
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'location')) {
      throw e;
    }
  }

  return {
    locale: null,
    locationInfo: null,
  };
}

export type Loader = typeof loader;

type HeistEdgeWithNode = HeistEdge & { node: Heist };
type ReviewEdgeWithNode = ReviewEdge & { node: Review };

// TODO translations
export default function PlaceId() {
  const { locationInfo, locale } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const heists =
    locationInfo?.heists?.edges?.filter<HeistEdgeWithNode>(
      (heist): heist is HeistEdgeWithNode => !!heist?.node,
    ) ?? [];
  const reviews =
    locationInfo?.reviews?.edges?.filter<ReviewEdgeWithNode>(
      (review): review is ReviewEdgeWithNode => !!review?.node,
    ) ?? [];

  // TODO get basic info from Google Places API
  if (!locationInfo?.location) {
    return (
      <Section className="space-y-4" size="1">
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            TODO PLACEHOLDER TITLE
          </Heading>
        </Dialog.Title>
        <Dialog.Description asChild>
          <Grid gap="2">
            <Text as="p">TODO PLACEHOLDER DESCRIPTION</Text>
          </Grid>
        </Dialog.Description>
      </Section>
    );
  }

  return (
    <>
      <Section className="space-y-4" size="1">
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            {locationInfo.location.name}
          </Heading>
        </Dialog.Title>
        <Dialog.Description asChild>
          <Grid gap="2">
            <Text as="p">{locationInfo.location.address}</Text>
          </Grid>
        </Dialog.Description>
        <Text as="p">{locationInfo.location.reviewCount} reviews</Text>
        {locationInfo.location.averageRating && (
          <Text as="p">{locationInfo.location.averageRating} average rating</Text>
        )}
      </Section>
      {/* TODO tabs ? */}
      {reviews.length > 0 && (
        <Section className="space-y-4" size="1">
          <Heading as="h3" size="8">
            Reviews
          </Heading>

          {reviews.map((review) => (
            <Grid gap="2" key={review.node.id}>
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
            </Grid>
          ))}
        </Section>
      )}
      {heists.length > 0 && (
        <Section className="space-y-4" size="1">
          <Heading as="h3" size="8">
            {t('common.heists')}
          </Heading>

          {heists.map((heist) => (
            <Grid gap="2" key={heist.node?.id}>
              <Link className="w-fit" to="/">
                <Heading as="h3" size="6">
                  {heist.node.name}
                </Heading>
              </Link>
              <Text as="p">{heist.node.difficulty}</Text>
              <Text as="p">
                {Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
                  heist.node.minimumPayout,
                )}
              </Text>
              <Text as="p">
                {Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(
                  heist.node.maximumPayout,
                )}
              </Text>
              <Text as="p">
                {new Date(heist.node.startAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </Grid>
          ))}
        </Section>
      )}
    </>
  );
}
