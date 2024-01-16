import { gql, type GraphQLClient } from 'graphql-request';

import type {
  CreateAssetInput,
  Mutation,
  MutationDeleteAssetArgs,
  Query,
  QueryAssetArgs,
  UpdateAssetInput,
} from '~api/types';

/**
 * Query all assets.
 */
export const getAssets = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'assets'>>(gql`
    query {
      assets {
        edges {
          node {
            id
            name
            price
            type
            description
            teamAsset
          }
        }
      }
    }
  `);
};

/**
 * Query an asset by id.
 */
export const getAsset = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'asset'>, QueryAssetArgs>(
    gql`
      query ($id: ID!) {
        asset(id: $id) {
          id
          name
          price
          type
          description
          maxQuantity
          teamAsset
          heist {
            id
            name
          }
          createdAt
          updatedAt
          createdBy {
            id
            username
          }
          updatedBy {
            id
            username
          }
        }
      }
    `,
    { id: `/assets/${id}` },
  );
};

/**
 * Create a new asset.
 */
export const createAsset = async (
  client: GraphQLClient,
  input: Omit<CreateAssetInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createAsset'>, { input: CreateAssetInput }>(
    gql`
      mutation ($input: createAssetInput!) {
        createAsset(input: $input) {
          asset {
            id
            name
            price
            type
            description
            teamAsset
            heist {
              id
              name
            }
            createdAt
            updatedAt
            createdBy {
              id
              username
            }
            updatedBy {
              id
              username
            }
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
 * Update an asset.
 */
export const updateAsset = async (
  client: GraphQLClient,
  input: Omit<UpdateAssetInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateAsset'>, { input: UpdateAssetInput }>(
    gql`
      mutation ($input: updateAssetInput!) {
        updateAsset(input: $input) {
          asset {
            id
            name
            price
            type
            description
            teamAsset
            heist {
              id
              name
            }
            createdAt
            updatedAt
            createdBy {
              id
              username
            }
            updatedBy {
              id
              username
            }
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
 * Delete an asset.
 */
export const deleteAsset = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteAsset'>, MutationDeleteAssetArgs>(
    gql`
      mutation ($id: ID!) {
        deleteAsset(input: $input) {
          asset {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/assets/${id}`,
      },
    },
  );
};
