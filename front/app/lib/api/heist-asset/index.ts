import { gql, type GraphQLClient } from 'graphql-request';

import type { Mutation } from '~api/types';

type QueryReduce = {
  params: string[];
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
  const { query, inputs, params } = input.assets.reduce<QueryReduce>(
    (acc, curr, index) => {
      acc.params.push(`$input${index}: createHeistAssetInput!`);
      acc.query += `create${index}: createHeistAsset(input: $input${index}) {
        heistAsset {
          id
        }
      }
    `;

      acc.inputs[`input${index}`] = {
        crewMember: input.crewMemberId,
        asset: curr.id,
        quantity: curr.quantity,
      };

      return acc;
    },
    {
      params: [],
      query: '',
      inputs: {},
    },
  );

  return client.request<Pick<Mutation, 'createHeistAsset'>>(
    gql`
      mutation CreateHeistAsset(${params.join(', ')}) {
        ${query}
      }
    `,
    {
      ...inputs,
    },
  );
};
