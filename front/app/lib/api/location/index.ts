import { gql, type GraphQLClient } from 'graphql-request';

import type {
  Mutation,
  MutationDeleteLocationArgs,
  MutationUpdateLocationArgs,
  Query,
  QueryLocationArgs,
  UpdateLocationInput,
} from '~api/types';
import type { GooglePlace } from '~api/types/maps';

/**
 * Get the location info for a place.
 */
export const getLocationInfo = async (client: GraphQLClient, placeId: string) => {
  return client.request<
    Pick<Query, 'location' | 'heists' | 'reviews'>,
    { place: string; placeId: string }
  >(
    gql`
      query ($place: String!, $placeId: ID!) {
        location(id: $placeId) {
          name
          address
          reviewCount
          averageRating
        }

        heists(location__placeId: $place) {
          edges {
            node {
              difficulty
              id
              maximumPayout
              minimumPayout
              name
              preferedTactic
              startAt
              establishment {
                contractor {
                  id
                }
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
            }
          }
        }
      }
    `,
    {
      placeId: `/locations/${placeId}`,
      place: placeId,
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
    `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,formattedAddress&key=${key}&languageCode=${languageCode}`,
  );

  const data: GooglePlace | { error: {} } = await response.json();

  if ('error' in data) {
    return null;
  }

  return data;
};
