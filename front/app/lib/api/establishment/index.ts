import { gql, type GraphQLClient } from 'graphql-request';

import type {
  Mutation,
  MutationDeleteEstablishmentArgs,
  MutationUpdateEstablishmentArgs,
  Query,
  QueryEstablishmentArgs,
  QueryEstablishmentsArgs,
  UpdateEstablishmentInput,
} from '~api/types';

/**
 * Query the list of all establishments of a contractor.
 */
export const getEstablishmentsOfContractor = async (
  client: GraphQLClient,
  contractorId: QueryEstablishmentsArgs['contractor__id'],
) => {
  return client.request<Pick<Query, 'establishments'>, QueryEstablishmentsArgs>(
    gql`
      query ($contractor__id: String!) {
        establishments(contractor__id: $contractor__id) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    { contractor__id: contractorId },
  );
};

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
export const getEstablishment = async (client: GraphQLClient, id: string, asAdmin = false) => {
  const adminFields = gql`
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
  `;

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
          ${asAdmin ? adminFields : ''}
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
