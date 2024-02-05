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

type QueryReduce = {
  params: string;
  query: string;
  inputs: Record<string, { crewMember: string; asset: string; quantity: number }>;
};
export const bulkCreateHeistAsset = async (
  client: GraphQLClient,
  input: {
    crewMemberId: string;
    assets: {
      id: string;
      quantity: number;
    }[];
  },
) => {
  const { query, inputs } = input.assets.reduce<QueryReduce>(
    (acc, curr) => {
      acc.params += `$input${curr.id}: createHeistAssetInput!`;
      acc.query += `
      create${curr.id}: createHeistAsset(input: $input${curr.id}) {
        heistAsset {
          id
          name
        }
      }
    `;

      acc.inputs[`input${curr.id}`] = {
        crewMember: input.crewMemberId,
        asset: curr.id,
        quantity: curr.quantity,
      };

      return acc;
    },
    {
      params: '',
      query: '',
      inputs: {},
    },
  );
  return client.request<Pick<Mutation, 'createHeistAsset'>>(
    gql`
      mutation CreateHeistAsset($input: [createHeistAssetInput]!) {
        ${query}
      }
    `,
    {
      ...inputs,
    },
  );
};
