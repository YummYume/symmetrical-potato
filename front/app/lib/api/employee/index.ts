import { gql, type GraphQLClient } from 'graphql-request';

import type { Query, QueryEmployeeArgs, QueryEmployeesArgs } from '~api/types';

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
            user {
              id
              username
            }
          }
        }
      }
    }
  `);
};

/**
 * Query an employee by id.
 */
export const getEmployee = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'employee'>, QueryEmployeeArgs>(
    gql`
      query ($id: ID!) {
        employee(id: $id) {
          id
          user {
            id
            username
          }
        }
      }
    `,
    { id },
  );
};

/**
 * Query the list of employees of given establishments
 */
export const getEmployeesEstablishments = async (client: GraphQLClient, ids: string[]) => {
  return client.request<Pick<Query, 'employees'>, QueryEmployeesArgs>(
    gql`
      query ($establishment__id: Iterable!) {
        employees(establishment__id: $establishment__id) {
          edges {
            node {
              id
              establishment {
                id
              }
              user {
                id
                username
              }
            }
          }
        }
      }
    `,
    { establishment__id: ids },
  );
};
