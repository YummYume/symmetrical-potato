import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

export const getLocationInfo = async (client: GraphQLClient, placeId: string) => {
  return client.request<Query>(
    gql`
      query ($placeId: String!) {
        locations(placeId: $placeId) {
          edges {
            node {
              name
              address
            }
          }
        }
        heists(location__placeId: $placeId) {
          edges {
            node {
              name
            }
          }
        }
      }
    `,
    {
      placeId,
    },
  );
};
