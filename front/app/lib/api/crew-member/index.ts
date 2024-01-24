import { gql, type GraphQLClient } from 'graphql-request';

import type {
  CreateCrewMemberInput,
  DeleteCrewMemberInput,
  Mutation,
  UpdateCrewMemberInput,
} from '~api/types';

export const createCrewMember = async (
  client: GraphQLClient,
  input: Omit<CreateCrewMemberInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createCrewMember'>, CreateCrewMemberInput>(
    gql`
      mutation CreateCrewMember($heist: String!, $user: String!) {
        createCrewMember(input: { heist: $heist, user: $user }) {
          id
        }
      }
    `,
    {
      heist: `/heists/${input.heist}`,
      user: input.user,
    },
  );
};

export const isAlreadyIn = async (client: GraphQLClient) => {};

export const deleteCrewMember = async (
  client: GraphQLClient,
  input: Omit<DeleteCrewMemberInput, 'clientMutationId'>,
) => {};

export const updateCrewMember = async (
  client: GraphQLClient,
  input: Omit<UpdateCrewMemberInput, 'clientMutationId'>,
) => {};
