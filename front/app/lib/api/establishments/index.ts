import { gql, type GraphQLClient } from 'graphql-request';

import type {
  Mutation,
  MutationDeleteEstablishmentArgs,
  MutationUpdateEstablishmentArgs,
  Query,
  QueryEstablishmentArgs,
  UpdateEstablishmentInput,
} from '~api/types';

/**
 * Query all establishments.
 */
export const getEstablishments = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'establishments'>>(gql`
    query {
      establishments {
        edges {
          node {
            id
            name
            description
          }
        }
      }
    }
  `);
};

/**
 * Query an establishment by id.
 */
export const getEstablishment = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'establishment'>, QueryEstablishmentArgs>(
    gql`
      query GetEstablishment($id: ID!) {
        establishment(id: $id) {
          id
          name
          description
          minimumWage
          minimumWorkTimePerWeek
          contractorCut
          employeeCut
          crewCut
          reviewCount
          averageRating
          contractor {
            id
            username
            mainRole
            profile {
              description
            }
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
    {
      id: `/establishments/${id}`,
    },
  );
};

/**
 * Update an establishment.
 */
export const updateEstablishment = async (
  client: GraphQLClient,
  input: Omit<UpdateEstablishmentInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateEstablishment'>, MutationUpdateEstablishmentArgs>(
    gql`
      mutation UpdateEstablishment($input: updateEstablishmentInput!) {
        updateEstablishment(input: $input) {
          establishment {
            id
            name
            description
            minimumWage
            minimumWorkTimePerWeek
            contractorCut
            employeeCut
            crewCut
            reviewCount
            averageRating
            contractor {
              id
              username
              mainRole
              profile {
                description
              }
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
 * Delete an establishment.
 */
export const deleteEstablishment = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteEstablishment'>, MutationDeleteEstablishmentArgs>(
    gql`
      mutation DeleteEstablishment($input: deleteEstablishmentInput!) {
        deleteEstablishment(input: $input) {
          establishment {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/establishments/${id}`,
      },
    },
  );
};
