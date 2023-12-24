import { type GraphQLClient, gql } from 'graphql-request';

import type {
  Query,
  Mutation,
  CreateUserInput,
  MutationRequestTokenArgs,
  MutationCreateUserArgs,
  RequestTokenInput,
} from '~api/types';

export const getCurrentUser = async (client: GraphQLClient) => {
  return client.request<Query>(gql`
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

type RegisterInput = Required<Omit<CreateUserInput, 'clientMutationId'>>;

export const requestRegister = async (client: GraphQLClient, registerInput: RegisterInput) => {
  return client.request<Mutation, MutationCreateUserArgs>(
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

type LoginInput = Omit<RequestTokenInput, 'clientMutationId'>;

export const requestAuthToken = async (client: GraphQLClient, loginInput: LoginInput) => {
  return client.request<Mutation, MutationRequestTokenArgs>(
    gql`
      mutation RequestToken($input: requestTokenInput!) {
        requestToken(input: $input) {
          token {
            token
            tokenTtl
          }
        }
      }
    `,
    {
      input: loginInput,
    },
  );
};
