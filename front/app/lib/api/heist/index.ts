import dayjs from 'dayjs';
import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '~api/types';

export const getDayHeists = async (client: GraphQLClient) => {
  return client.request<Query>(
    gql`
      query ($now: String!, $tomorrow: String!) {
        heists(startAt: { after: $now, before: $tomorrow }) {
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
      now: dayjs().toISOString(),
      tomorrow: dayjs().add(1, 'day').startOf('day').toISOString(),
    },
  );
};
