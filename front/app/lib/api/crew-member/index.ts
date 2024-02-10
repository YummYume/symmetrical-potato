import { gql, type GraphQLClient } from 'graphql-request';

import type { CreateCrewMemberInput, Mutation, Query } from '~api/types';

/**
 * Get all crew members of a user for a heist.
 */
export const getCrewMemberByUserAndHeist = async (
  client: GraphQLClient,
  input: { heistId: string; userId: string },
) => {
  const { crewMembers } = await client.request<Pick<Query, 'crewMembers'>>(
    gql`
      query ($heistId: String, $userId: String) {
        crewMembers(heist__id: $heistId, user__id: $userId) {
          edges {
            node {
              id
              heist {
                id
              }
              heistAssets {
                edges {
                  node {
                    id
                    totalSpent
                    quantity
                    asset {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      heistId: `/heists/${input.heistId}`,
      userId: input.userId,
    },
  );

  return crewMembers.edges.length === 1 ? crewMembers.edges[0].node : null;
};

export const getCrewMemberByUserAndHeistPartial = async (
  client: GraphQLClient,
  input: { heistId: string; userId: string },
) => {
  const { crewMembers } = await client.request<Pick<Query, 'crewMembers'>>(
    gql`
      query ($heistId: String, $userId: String) {
        crewMembers(heist__id: $heistId, user__id: $userId) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    {
      heistId: `/heists/${input.heistId}`,
      userId: input.userId,
    },
  );

  return crewMembers.edges.length === 1 ? crewMembers.edges[0].node : null;
};

/**
 * Create a crew member.
 */
export const createCrewMember = async (
  client: GraphQLClient,
  input: Omit<CreateCrewMemberInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createCrewMember'>, CreateCrewMemberInput>(
    gql`
      mutation CreateCrewMember($heist: String!, $user: String!) {
        createCrewMember(input: { heist: $heist, user: $user }) {
          crewMember {
            id
          }
        }
      }
    `,
    {
      heist: `/heists/${input.heist}`,
      user: input.user,
    },
  );
};

/**
 * Delete a crew member.
 */
export const deleteCrewMember = async (client: GraphQLClient, crewMemberId: string) => {
  return client.request<Pick<Mutation, 'deleteCrewMember'>>(
    gql`
      mutation DeleteCrewMember($id: ID!) {
        deleteCrewMember(input: { id: $id }) {
          crewMember {
            id
          }
        }
      }
    `,
    {
      id: crewMemberId,
    },
  );
};
