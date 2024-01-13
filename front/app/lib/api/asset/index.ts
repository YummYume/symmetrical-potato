import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

/**
 * Query all assets.
 */
export const getAssets = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'assets'>>(gql`
    query {
      assets {
        edges {
          node {
            id
            name
            price
            type
            description
          }
        }
      }
    }
  `);
};
