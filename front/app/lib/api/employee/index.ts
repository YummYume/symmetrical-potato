import { gql, type GraphQLClient } from 'graphql-request';

import type {
  CreateEmployeeInput,
  Mutation,
  MutationCreateEmployeeArgs,
  MutationDeleteEmployeeArgs,
  MutationUpdateEmployeeArgs,
  MutationValidateEmployeeArgs,
  Query,
  QueryEmployeeArgs,
  QueryEmployeesArgs,
  UpdateEmployeeInput,
  ValidateEmployeeInput,
} from '~api/types';

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
          codeName
          weeklySchedule
          planning
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
 * Query the list of employees for a contractor.
 */
export const getEmployeesForContractor = async (client: GraphQLClient, contractorId: string) => {
  return client.request<Pick<Query, 'employees'>, QueryEmployeesArgs>(
    gql`
      query ($establishment__contractor__id: String!) {
        employees(establishment__contractor__id: $establishment__contractor__id) {
          edges {
            node {
              id
              codeName
              status
              motivation
              description
              planning
              weeklySchedule
              establishment {
                id
                name
              }
              user {
                id
                username
                mainRole
                globalRating
                profile {
                  id
                  description
                }
              }
            }
          }
        }
      }
    `,
    {
      establishment__contractor__id: `/users/${contractorId}`,
    },
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
              codeName
              status
              description
              establishment {
                id
              }
              user {
                id
                username
                mainRole
                globalRating
                profile {
                  description
                }
              }
            }
          }
        }
      }
    `,
    { establishment__id: ids },
  );
};

/**
 * Create an employee.
 */
export const createEmployee = async (
  client: GraphQLClient,
  input: Omit<CreateEmployeeInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createEmployee'>, MutationCreateEmployeeArgs>(
    gql`
      mutation ($input: createEmployeeInput!) {
        createEmployee(input: $input) {
          employee {
            id
          }
        }
      }
    `,
    { input },
  );
};

/**
 * Validate an employee.
 */
export const validateEmployee = async (
  client: GraphQLClient,
  input: Omit<ValidateEmployeeInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'validateEmployee'>, MutationValidateEmployeeArgs>(
    gql`
      mutation ($input: validateEmployeeInput!) {
        validateEmployee(input: $input) {
          employee {
            id
          }
        }
      }
    `,
    { input },
  );
};

/**
 * Update an employee.
 */
export const updateEmployee = async (
  client: GraphQLClient,
  input: Omit<UpdateEmployeeInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateEmployee'>, MutationUpdateEmployeeArgs>(
    gql`
      mutation ($input: updateEmployeeInput!) {
        updateEmployee(input: $input) {
          employee {
            id
          }
        }
      }
    `,
    { input },
  );
};

/**
 * Delete an employee.
 */
export const deleteEmployee = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteEmployee'>, MutationDeleteEmployeeArgs>(
    gql`
      mutation DeleteEmployee($input: deleteEmployeeInput!) {
        deleteEmployee(input: $input) {
          employee {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/employees/${id}`,
      },
    },
  );
};
