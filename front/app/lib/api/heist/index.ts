import { type GraphQLClient, gql } from 'graphql-request';

import type { CreateHeistInput, DeleteHeistInput, Mutation } from '~api/types';

export const createHeist = async (client: GraphQLClient, input: CreateHeistInput) => {
  return client.request<Mutation>(
    gql`
      mutation CreateHeist($input: createHeistInput!) {
        createHeist(input: $input) {
          heist {
            name
            description
            startTime
            endTime
            status
            totalAmount
          }
        }
      }
    `,
    {
      input,
    },
  );
};

export const editHeist = async (client: GraphQLClient, id: string) => {
  return client.request<Mutation>(
    gql`
      mutation EditHeist($input: editHeistInput!) {
        editHeist(input: $input) {
          heist {
            id
          }
        }
      }
    `,
    {
      input: {
        id,
      },
    },
  );
};

export const deleteHeist = async (client: GraphQLClient, input: DeleteHeistInput) => {
  return client.request<Mutation>(
    gql`
      mutation DeleteHeist($input: deleteHeistInput!) {
        deleteHeist(input: $input) {
          heist {
            id
          }
        }
      }
    `,
    {
      input,
    },
  );
};
