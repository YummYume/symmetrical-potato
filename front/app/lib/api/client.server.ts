import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient(
  `${process.env.API_HOST}${process.env.API_GRAPHQL_ENDPOINT}`,
  { credentials: 'include' },
);
