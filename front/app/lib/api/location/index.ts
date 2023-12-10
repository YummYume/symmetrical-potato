import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

export const getLocationInfo = async (client: GraphQLClient, placeId: string) => {
  return client.request<Query>(
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
