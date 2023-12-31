import { gql, type GraphQLClient } from 'graphql-request';

import type { Query } from '../types';

/**
 * Query the list of employees.
 */
export const getEmployees = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'employees'>>(gql`
    query {
      employees {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);
};
