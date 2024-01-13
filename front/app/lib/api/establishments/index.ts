import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

/**
 * Query all establishments.
 */
export const getEstablishments = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'establishments'>>(gql`
    query {
      establishments {
        edges {
          node {
            id
            name
            description
          }
        }
      }
    }
  `);
};
