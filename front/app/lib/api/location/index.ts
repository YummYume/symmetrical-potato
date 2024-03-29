import { gql, type GraphQLClient } from 'graphql-request';

import dayjs from '~/lib/utils/dayjs';
import {
  HeistPhaseEnum,
  type Mutation,
  type MutationDeleteLocationArgs,
  type MutationUpdateLocationArgs,
  type Query,
  type QueryLocationArgs,
  type UpdateLocationInput,
} from '~api/types';

import type { QueryHeistsArgs } from '~api/types';
import type { GooglePlace } from '~api/types/maps';

/**
 * Get the location info for a place.
 */
export const getLocationInfo = async (client: GraphQLClient, placeId: string) => {
  return client.request<
    Pick<Query, 'location' | 'heists' | 'reviews'>,
    { place: string; placeId: string; phase: HeistPhaseEnum[]; startAt: QueryHeistsArgs['startAt'] }
  >(
    gql`
      query ($place: String!, $placeId: ID!, $phase: Iterable, $startAt: [HeistFilter_startAt]!) {
        location(id: $placeId) {
          name
          address
          reviewCount
          averageRating
          latitude
          longitude
          placeId
        }

        heists(location__placeId: $place, phase: $phase, startAt: $startAt) {
          edges {
            node {
              difficulty
              id
              maximumPayout
              minimumPayout
              name
              preferedTactic
              startAt
              shouldEndAt
              visibility
              objectives
              name
              description
              phase
              crewMembers {
                totalCount
              }
              establishment {
                contractor {
                  id
                }
                id
                name
              }
            }
          }
        }

        reviews(location__placeId: $place) {
          edges {
            node {
              id
              rating
              comment
              createdAt
              user {
                id
                username
              }
              ratingNumber
            }
          }
        }
      }
    `,
    {
      placeId: `/locations/${placeId}`,
      place: placeId,
      phase: [HeistPhaseEnum.Planning],
      startAt: [
        {
          after: dayjs().startOf('day').toISOString(),
        },
      ],
    },
  );
};

/**
 * Get the location (not public).
 */
export const getLocation = async (client: GraphQLClient, placeId: string) => {
  return client.request<Pick<Query, 'location'>, QueryLocationArgs>(
    gql`
      query ($id: ID!) {
        location(id: $id) {
          placeId
          name
          address
          latitude
          longitude
          reviewCount
          averageRating
          createdAt
          updatedAt
          createdBy {
            id
            username
          }
          updatedBy {
            id
            username
          }
        }
      }
    `,
    {
      id: `/locations/${placeId}`,
    },
  );
};

/**
 * Query all locations.
 */
export const getLocations = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'locations'>>(gql`
    query {
      locations {
        edges {
          node {
            id
            name
            address
            placeId
            reviewCount
            averageRating
          }
        }
      }
    }
  `);
};

/**
 * Update a location.
 */
export const updateLocation = async (
  client: GraphQLClient,
  input: Omit<UpdateLocationInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateLocation'>, MutationUpdateLocationArgs>(
    gql`
      mutation UpdateLocation($input: updateLocationInput!) {
        updateLocation(input: $input) {
          location {
            id
            name
            address
            placeId
            reviewCount
            averageRating
          }
        }
      }
    `,
    {
      input,
    },
  );
};

/**
 * Delete a location.
 */
export const deleteLocation = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteLocation'>, MutationDeleteLocationArgs>(
    gql`
      mutation DeleteLocation($input: deleteLocationInput!) {
        deleteLocation(input: $input) {
          location {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/locations/${id}`,
      },
    },
  );
};

/**
 * Get the location of a place from Google Maps.
 */
export const getGoogleLocation = async ({
  key,
  languageCode = 'en',
  placeId,
}: {
  key: string;
  languageCode?: string;
  placeId: string;
}) => {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress,location&key=${key}&languageCode=${languageCode}`,
  );

  const data: GooglePlace | { error: {} } = await response.json();

  if ('error' in data) {
    console.error('Error fetching location from Google Maps', data.error);

    return null;
  }

  return data;
};
