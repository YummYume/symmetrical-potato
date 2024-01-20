import { gql, type GraphQLClient } from 'graphql-request';

import { CrewMemberStatusEnum, HeistPhaseEnum, type Query, type QueryHeistsArgs } from '~api/types';
import dayjs from '~utils/dayjs';

/**
 * Query all heists.
 */
export const getHeists = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'heists'>>(gql`
    query {
      heists {
        edges {
          node {
            id
            name
            startAt
            location {
              name
            }
            crewMembers {
              totalCount
            }
          }
        }
      }
    }
  `);
};

/**
 * Will return heists for today.
 */
export const getHeistsForToday = async (client: GraphQLClient) => {
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

/**
 * Will return heists statistics for the last 90 days
 *
 * @todo disable pagination for this query
 */
export const getHeistStatistics = async (
  client: GraphQLClient,
): Promise<{
  successfulHeists: number;
  failedHeists: number;
  cancelledHeists: number;
  totalHeists: number;
  freeHeisters: number;
  jailedHeisters: number;
  deadHeisters: number;
  totalHeisters: number;
}> => {
  const { heists } = await client.request<Pick<Query, 'heists'>, QueryHeistsArgs>(
    gql`
      query ($startAt: [HeistFilter_startAt]!, $phase: Iterable!) {
        heists(startAt: $startAt, phase: $phase) {
          edges {
            node {
              id
              phase
              crewMembers {
                totalCount
                edges {
                  node {
                    status
                  }
                }
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
          after: dayjs().subtract(90, 'day').startOf('day').toISOString(),
        },
      ],
      phase: [HeistPhaseEnum.Succeeded, HeistPhaseEnum.Failed, HeistPhaseEnum.Cancelled],
    },
  );

  const results = {
    failedHeists: 0,
    successfulHeists: 0,
    cancelledHeists: 0,
    freeHeisters: 0,
    jailedHeisters: 0,
    deadHeisters: 0,
  };

  heists.edges.forEach(({ node }) => {
    switch (node.phase) {
      case HeistPhaseEnum.Failed:
        results.failedHeists++;
        break;
      case HeistPhaseEnum.Succeeded:
        results.successfulHeists++;
        break;
      case HeistPhaseEnum.Cancelled:
        results.cancelledHeists++;
        break;
      default:
        break;
    }

    if (node.phase === HeistPhaseEnum.Succeeded || node.phase === HeistPhaseEnum.Failed) {
      node.crewMembers.edges.forEach(({ node }) => {
        switch (node.status) {
          case CrewMemberStatusEnum.Free:
            results.freeHeisters++;
            break;
          case CrewMemberStatusEnum.Jailed:
            results.jailedHeisters++;
            break;
          case CrewMemberStatusEnum.Dead:
            results.deadHeisters++;
            break;
          default:
            break;
        }
      });
    }
  });

  return {
    ...results,
    totalHeists: results.failedHeists + results.successfulHeists + results.cancelledHeists,
    totalHeisters: results.freeHeisters + results.jailedHeisters + results.deadHeisters,
  };
};
