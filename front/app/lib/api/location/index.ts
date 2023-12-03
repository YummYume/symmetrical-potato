import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

export const getLocation = async (client: GraphQLClient) => {
  return client.request<Query>(gql`
    query {
      heists {
        name
        minimumPayout
      }
    }
  `);
};
