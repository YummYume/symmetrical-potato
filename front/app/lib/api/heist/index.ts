import { type GraphQLClient, gql } from 'graphql-request';

import type {
  CreateHeistInput,
  Mutation,
  MutationCreateHeistArgs,
  MutationUpdateHeistArgs,
  UpdateHeistInput,
} from '~api/types';

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
      input,
    },
  );
};
