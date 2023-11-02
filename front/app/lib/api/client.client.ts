import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient(
  `${process.env.PUBLIC_API_HOST}${process.env.API_GRAPHQL_ENDPOINT}`,
  { credentials: 'include' },
);
