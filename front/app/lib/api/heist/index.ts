import dayjs from 'dayjs';
import { gql, type GraphQLClient } from 'graphql-request';

import type { Query, QueryHeistsArgs } from '~api/types';

export const getDayHeists = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'heists'>, QueryHeistsArgs>(
    gql`
      query ($startAt: [HeistFilter_startAt]!) {
        heists(startAt: $startAt) {
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
      startAt: [
        {
          before: dayjs().toISOString(),
          after: dayjs().add(1, 'day').startOf('day').toISOString(),
        },
      ],
    },
  );
};
