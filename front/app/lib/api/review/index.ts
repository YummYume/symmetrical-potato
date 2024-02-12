import { gql, type GraphQLClient } from 'graphql-request';

import { type Query } from '~api/types';

import type { QueryReviewsArgs } from '~api/types';

/**
 * Get the reviews for an establishment.
 */
export const getReviewsForEstablishment = async (
  client: GraphQLClient,
  establishmentId: string,
) => {
  return client.request<Pick<Query, 'reviews'>, QueryReviewsArgs>(
    gql`
      query ($establishment__id: Iterable) {
        reviews(establishment__id: $establishment__id) {
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
      establishment__id: [`/establishments/${establishmentId}`],
    },
  );
};
