import { type GraphQLClient, gql } from 'graphql-request';

import type { Query, Mutation } from '~api/types';

export const getCurrentUser = async (client: GraphQLClient) => {
  return client.request<Query>(gql`
    query {
      meUser {
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

export const requestAuthToken = async (
  client: GraphQLClient,
  username: string,
  password: string,
) => {
  return client.request<Mutation>(
    gql`
      mutation LoginUser($input: loginUserInput!) {
        loginUser(input: $input) {
          user {
            token
            tokenTtl
          }
        }
      }
    `,
    {
      input: {
        username,
        password,
      },
    },
  );
};
