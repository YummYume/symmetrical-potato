import { gql, type GraphQLClient } from 'graphql-request';

import type { Mutation } from '~api/types';

type QueryReduce<T> = {
  params: string[];
  query: string;
  inputs: Record<string, T>;
};

/**
 * Create multiple heist assets
 */
export const bulkCreateHeistAssets = async (
  client: GraphQLClient,
  input: {
    crewMemberId: string;
    assets: {
      id: string;
      quantity: number;
    }[];
  },
) => {
  const { query, inputs, params } = input.assets.reduce<
    QueryReduce<{ crewMember: string; asset: string; quantity: number }>
  >(
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

/**
 * Update multiple heist assets
 */
export const bulkUpdateHeistAssets = async (
  client: GraphQLClient,
  input: {
    heistAssets: {
      id: string;
      quantity: number;
    }[];
  },
) => {
  const { query, inputs, params } = input.heistAssets.reduce<
    QueryReduce<{
      id: string;
      quantity: number;
    }>
  >(
    (acc, curr, index) => {
      acc.params.push(`$input${index}: updateHeistAssetInput!`);
      acc.query += `update${index}: updateHeistAsset(input: $input${index}) {
        heistAsset {
          id
        }
      }
    `;

      acc.inputs[`input${index}`] = {
        id: curr.id,
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

  return client.request<Pick<Mutation, 'updateHeistAsset'>>(
    gql`
      mutation UpdateHeistAsset(${params.join(', ')}) {
        ${query}
      }
    `,
    {
      ...inputs,
    },
  );
};
