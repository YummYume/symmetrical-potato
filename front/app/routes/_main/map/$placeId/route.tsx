import * as Dialog from '@radix-ui/react-dialog';
import { Button, Grid, Heading, Section, Text } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getHeistsByCrewMember } from '~/lib/api/heist';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { getEnv } from '~/lib/utils/env';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { getGoogleLocation, getLocationInfo } from '~api/location';
import {
  HeistVisibilityEnum,
  type Heist,
  type HeistEdge,
  type Review,
  type ReviewEdge,
} from '~api/types';
import { Link } from '~components/Link';
import { hasPathError } from '~utils/api';
import { denyAccessUnlessGranted, hasRoles } from '~utils/security.server';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);
  const isContractor = hasRoles(context.user, ROLES.CONTRACTOR);
  const isAdmin = hasRoles(context.user, ROLES.ADMIN);
  const isHeister = hasRoles(context.user, ROLES.HEISTER);

  // Wil be used to check if the current user is already a crew member of the heist
  let userCrewHeistsId: string[] = [];

  if (!params.placeId) {
    throw redirect('/dashboard');
  }

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
      isAdmin,
      isHeister,
      user,
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
    userCrewHeistsId,
    isContractor,
    isAdmin,
    isHeister,
    user,
  };
}

export type Loader = typeof loader;

type HeistEdgeWithNode = HeistEdge & { node: Heist };
type ReviewEdgeWithNode = ReviewEdge & { node: Review };

export default function PlaceId() {
  const {
    locationInfo,
    locale,
    place,
    placeId,
    isContractor,
    isAdmin,
    isHeister,
    user,
    userCrewHeistsId,
  } = useLoaderData<Loader>();
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
              <Link to={`/map/${placeId}/add`} className="link link--green" unstyled>
                {t('heist.add')}
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
        <Link to={`/map/${placeId}/add`} className="link link--green" unstyled>
          {t('heist.add')}
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
                {isHeister && (
                  <div>
                    {!userCrewHeistsId.includes(heist.node?.id) ? (
                      <>
                        <FormConfirmDialog
                          idForm={`heist-join-${getUriId(heist.node?.id)}`}
                          title={t('join')}
                          description={t('heist.join.confirm')}
                          action={`/map/${placeId}/${getUriId(heist.node?.id)}/join`}
                          actionColor="green"
                        >
                          <Button type="button" color="green">
                            {t('join')}
                          </Button>
                        </FormConfirmDialog>
                      </>
                    ) : (
                      <>
                        <FormConfirmDialog
                          idForm={`heist-leave-${getUriId(heist.node?.id)}`}
                          title={t('leave')}
                          description={t('heist.leave.confirm')}
                          action={`/map/${placeId}/${getUriId(heist.node?.id)}/leave`}
                        >
                          <Button type="button" color="red">
                            {t('leave')}
                          </Button>
                        </FormConfirmDialog>
                      </>
                    )}
                  </div>
                )}
                {isAdmin ||
                  (isContractor && heist.node.establishment.contractor.id === user?.id && (
                    <div className="flex items-center">
                      {heist.node.visibility === HeistVisibilityEnum.Draft && (
                        <Link
                          to={`/map/${placeId}/${getUriId(heist.node?.id)}/edit`}
                          className="link link--blue"
                          unstyled
                        >
                          {t('edit')}
                        </Link>
                      )}
                      <FormConfirmDialog
                        idForm={`heist-delete-${getUriId(heist.node?.id)}`}
                        title={t('delete')}
                        description={t('heist.delete.confirm')}
                        action={`/map/${placeId}/${getUriId(heist.node?.id)}/delete`}
                      >
                        <Button type="button" color="red">
                          {t('delete')}
                        </Button>
                      </FormConfirmDialog>
                    </div>
                  ))}
              </div>
              <Text as="p" className="underline">
                {new Date(heist.node.startAt).toLocaleDateString(locale, {
                  timeZone: 'UTC',
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
