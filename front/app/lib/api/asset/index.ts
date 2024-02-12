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
 * Get all assets.
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
            maxQuantity
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
 * Get all Global assets.
 */
export const getGlobalAssets = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'assets'>>(
    gql`
      query ($heistId: String) {
        assets(heist__id: $heistId) {
          edges {
            node {
              id
              name
              price
              maxQuantity
              type
              description
              teamAsset
            }
          }
        }
      }
    `,
    {
      heistId: '',
    },
  );
};

/**
 * Get all forbidden assets for a heist.
 */
export const getAssetsForbiddenForHeist = async (client: GraphQLClient, heistId: string) => {
  return client.request<Pick<Query, 'assets'>, { heistId: string }>(
    gql`
      query ($heistId: String) {
        assets(forbiddenHeists__id: $heistId) {
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
    `,
    { heistId: `/heists/${heistId}` },
  );
};

/**
 * Get a asset by id.
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
      mutation ($input: deleteAssetInput!) {
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
