import { type GraphQLClient, gql } from 'graphql-request';

import type { CreateHeistInput, Mutation, MutationCreateHeistArgs } from '~api/types';

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
