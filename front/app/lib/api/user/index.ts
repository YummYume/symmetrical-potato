import { type GraphQLClient, gql } from 'graphql-request';

import {
  type Query,
  type Mutation,
  type CreateUserInput,
  type MutationRequestTokenArgs,
  type MutationCreateUserArgs,
  type RequestTokenInput,
  type QueryUserArgs,
  type UpdateUserInput,
  type MutationUpdateUserArgs,
  type MutationValidateUserArgs,
  type MutationDeleteUserArgs,
  type MutationKillUserArgs,
  type MutationReviveUserArgs,
  type MutationUpdateProfileArgs,
  type UpdateProfileInput,
  UserStatusEnum,
} from '~api/types';

import type { MutationRefreshTokenArgs, MutationRevokeTokenArgs } from '~api/types';

/**
 * Query the currently logged in user.
 */
export const getCurrentUser = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'getMeUser'>>(gql`
    query {
      getMeUser {
        id
        username
        email
        balance
        globalRating
        roles
      }
    }
  `);
};

/**
 * Create a registration demand.
 */
export const createRegistrationDemand = async (
  client: GraphQLClient,
  registerInput: Required<Omit<CreateUserInput, 'clientMutationId'>>,
) => {
  return client.request<Pick<Mutation, 'createUser'>, MutationCreateUserArgs>(
    gql`
      mutation CreateUser($input: createUserInput!) {
        createUser(input: $input) {
          user {
            id
          }
        }
      }
    `,
    {
      input: registerInput,
    },
  );
};

/**
 * Request an auth token.
 */
export const requestAuthToken = async (
  client: GraphQLClient,
  loginInput: Omit<RequestTokenInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'requestToken'>, MutationRequestTokenArgs>(
    gql`
      mutation RequestToken($input: requestTokenInput!) {
        requestToken(input: $input) {
          token {
            token
            tokenTtl
            refreshToken
            refreshTokenTtl
          }
        }
      }
    `,
    {
      input: loginInput,
    },
  );
};

/**
 * Refresh an auth token.
 */
export const refreshAuthToken = async (client: GraphQLClient, refreshToken: string) => {
  return client.request<Pick<Mutation, 'refreshToken'>, MutationRefreshTokenArgs>(
    gql`
      mutation RefreshToken($input: refreshTokenInput!) {
        refreshToken(input: $input) {
          token {
            token
            tokenTtl
            refreshToken
            refreshTokenTtl
          }
        }
      }
    `,
    {
      input: {
        refreshToken,
      },
    },
  );
};

/**
 * Revoke a refresh token.
 */
export const revokeRefreshToken = async (client: GraphQLClient, refreshToken: string) => {
  return client.request<Pick<Mutation, 'revokeToken'>, MutationRevokeTokenArgs>(
    gql`
      mutation RevokeToken($input: revokeTokenInput!) {
        revokeToken(input: $input) {
          token {
            id
          }
        }
      }
    `,
    {
      input: {
        refreshToken,
      },
    },
  );
};

/**
 * Query all users.
 */
export const getUsers = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'users'>>(gql`
    query {
      users {
        edges {
          node {
            id
            username
            status
          }
        }
      }
    }
  `);
};

/**
 * Query a user by id. The queried user is not public.
 */
export const getUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'user'>, QueryUserArgs>(
    gql`
      query ($id: ID!) {
        user(id: $id) {
          id
          username
          email
          roles
          balance
          globalRating
          reason
          locale
          status
          mainRole
          profile {
            id
            description
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
    { id: `/users/${id}` },
  );
};

/**
 * Query a user by id. The queried user is public.
 */
export const getPublicUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'user'>, QueryUserArgs>(
    gql`
      query ($id: ID!) {
        user(id: $id) {
          id
          username
          globalRating
          mainRole
          profile {
            id
            description
          }
        }
      }
    `,
    { id: `/users/${id}` },
  );
};

/**
 * Update a user.
 */
export const updateUser = async (
  client: GraphQLClient,
  input: Omit<UpdateUserInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateUser'>, MutationUpdateUserArgs>(
    gql`
      mutation UpdateUser($input: updateUserInput!) {
        updateUser(input: $input) {
          user {
            id
            username
            email
            roles
            balance
            globalRating
            reason
            locale
            status
            mainRole
            profile {
              id
              description
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
 * Update a user profile.
 */
export const updateUserProfile = async (
  client: GraphQLClient,
  input: Omit<UpdateProfileInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateProfile'>, MutationUpdateProfileArgs>(
    gql`
      mutation UpdateProfile($input: updateProfileInput!) {
        updateProfile(input: $input) {
          profile {
            id
            description
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
 * Validate a user.
 */
export const validateUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'validateUser'>, MutationValidateUserArgs>(
    gql`
      mutation ValidateUser($input: validateUserInput!) {
        validateUser(input: $input) {
          user {
            id
            username
            email
            roles
            balance
            globalRating
            reason
            locale
            status
            mainRole
          }
        }
      }
    `,
    {
      input: {
        id: `/users/${id}`,
        status: UserStatusEnum.Verified,
      },
    },
  );
};

/**
 * Kill a user.
 */
export const killUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'killUser'>, MutationKillUserArgs>(
    gql`
      mutation KillUser($input: killUserInput!) {
        killUser(input: $input) {
          user {
            id
            username
            email
            roles
            balance
            globalRating
            reason
            locale
            status
            mainRole
          }
        }
      }
    `,
    {
      input: {
        id: `/users/${id}`,
        status: UserStatusEnum.Dead,
      },
    },
  );
};

/**
 * Revive a user.
 */
export const reviveUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'reviveUser'>, MutationReviveUserArgs>(
    gql`
      mutation ReviveUser($input: reviveUserInput!) {
        reviveUser(input: $input) {
          user {
            id
            username
            email
            roles
            balance
            globalRating
            reason
            locale
            status
            mainRole
          }
        }
      }
    `,
    {
      input: {
        id: `/users/${id}`,
        status: UserStatusEnum.Verified,
      },
    },
  );
};

/**
 * Delete a user.
 */
export const deleteUser = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteUser'>, MutationDeleteUserArgs>(
    gql`
      mutation DeleteUser($input: deleteUserInput!) {
        deleteUser(input: $input) {
          user {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/users/${id}`,
      },
    },
  );
};
