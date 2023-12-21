import { gql, type GraphQLClient } from 'graphql-request';

import { CrewMemberStatusEnum, HeistPhaseEnum, HeistVisibilityEnum } from '~api/types';
import dayjs from '~utils/dayjs';

import type {
  QueryHeistsArgs,
  Query,
  CreateHeistInput,
  Mutation,
  MutationCreateHeistArgs,
  MutationUpdateHeistArgs,
  UpdateHeistInput,
  QueryHeistArgs,
} from '~api/types';

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

type heistIsMadeByParams = {
  id: string;
  userId: string;
};

/**
 * Check if a heist is made by a user
 */
export const heistIsMadeBy = async (
  client: GraphQLClient,
  { id, userId }: heistIsMadeByParams,
): Promise<boolean> => {
  if (!id || !userId) return false;

  const { heist } = await client.request<Pick<Query, 'heist'>, QueryHeistArgs>(
    gql`
      query ($id: ID!) {
        heist(id: $id) {
          establishment {
            contractor {
              id
            }
          }
        }
      }
    `,
    {
      id: `/heists/${id}`,
    },
  );

  if (!heist) {
    return false;
  }

  return heist.establishment.contractor.id === userId;
};

/**
 * Check if a heist is public
 */
export const heistIsPublic = async (client: GraphQLClient, id: string): Promise<boolean> => {
  const { heist } = await client.request<Pick<Query, 'heist'>, QueryHeistArgs>(
    gql`
      query ($id: ID!) {
        heist(id: $id) {
          visibility
        }
      }
    `,
    {
      id: `/heists/${id}`,
    },
  );

  if (!heist) {
    return false;
  }

  return heist.visibility === HeistVisibilityEnum.Public;
};

/**
 * Get a heist by id
 */
export const getHeist = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'heist'>>(
    gql`
      query ($id: ID!) {
        heist(id: $id) {
          id
          name
          description
          startAt
          shouldEndAt
          minimumPayout
          maximumPayout
          visibility
          minimumRequiredRating
          forbiddenAssets {
            edges {
              node {
                id
                name
              }
            }
          }
          forbiddenUsers {
            edges {
              node {
                id
                username
              }
            }
          }
          allowedEmployees {
            edges {
              node {
                id
                user {
                  id
                  username
                }
              }
            }
          }
          establishment {
            id
            contractor {
              id
            }
          }
          preferedTactic
          difficulty
          visibility
          objectives
        }
      }
    `,
    {
      id: `/heists/${id}`,
    },
  );
};

/**
 * Create a Heist
 */
export const createHeist = async (
  client: GraphQLClient,
  input: Omit<CreateHeistInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createHeist'>, MutationCreateHeistArgs>(
    gql`
      mutation CreateHeist($input: createHeistInput!) {
        createHeist(input: $input) {
          heist {
            id
            name
          }
        }
      }
    `,
    {
      input,
    },
  );
};

/**
 * Update a Heist
 */
export const updateHeist = async (
  client: GraphQLClient,
  input: Omit<UpdateHeistInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateHeist'>, MutationUpdateHeistArgs>(
    gql`
      mutation UpdateHeist($input: updateHeistInput!) {
        updateHeist(input: $input) {
          heist {
            id
            name
          }
        }
      }
    `,
    {
      input: { ...input, id: `/heists/${input.id}` },
    },
  );
};

/**
 * Delete a Heist
 */
export const deleteHeist = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteHeist'>>(
    gql`
      mutation DeleteHeist($id: ID!) {
        deleteHeist(input: { id: $id }) {
          heist {
            id
          }
        }
      }
    `,
    {
      id: `/heists/${id}`,
    },
  );
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
