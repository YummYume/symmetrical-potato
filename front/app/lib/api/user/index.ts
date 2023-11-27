import { type GraphQLClient, gql } from 'graphql-request';

import type { Query, Mutation } from '~api/types';

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

export const requestAuthToken = async (
  client: GraphQLClient,
  username: string,
  password: string,
) => {
  return client.request<Mutation>(
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
      input: {
        username,
        password,
      },
    },
  );
};
