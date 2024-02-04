import { gql, type GraphQLClient } from 'graphql-request';

import type { Mutation } from '~api/types';

export const createHeistAsset = async (
  client: GraphQLClient,
  input: {
    assetsPurchased: { id: string; quantity: number }[];
    crewMemberId: string;
    heistId: string;
  },
) => {
  return client.request<Pick<Mutation, 'createHeistAsset'>, MutationCreateHeistAssetArgs>(
    gql`
      mutation CreateHeistAsset($input: createHeistAssetInput!) {
        createHeistAsset(input: $input) {
          heistAsset {
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
