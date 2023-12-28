import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

export const getDayHeists = async (client: GraphQLClient) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return client.request<Query>(
    gql`
      query ($now: String!, $tomorrow: String!) {
        heists(startAt: { after: $now, before: $tomorrow }, page: 1, itemsPerPage: 15) {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              name
              startAt
              crewMembers {
                totalCount
              }
            }
          }
        }
      }
    `,
    {
      now: new Date().toISOString(),
      tomorrow: tomorrow.toISOString(),
    },
  );
};
