import { type GraphQLClient, gql } from 'graphql-request';

import type {
  CreateContractorRequestInput,
  Mutation,
  MutationCreateContractorRequestArgs,
  MutationDeleteContractorRequestArgs,
  MutationUpdateContractorRequestArgs,
  Query,
  QueryContractorRequestArgs,
  QueryContractorRequestsArgs,
  UpdateContractorRequestInput,
} from '~api/types';

/**
 * Query all contractor requests.
 */
export const getContractorRequests = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'contractorRequests'>, QueryContractorRequestsArgs>(
    gql`
      query {
        contractorRequests {
          edges {
            node {
              id
              reason
              status
              adminComment
              user {
                username
              }
            }
          }
        }
      }
    `,
    {},
  );
};

/**
 * Query a contractor request by id.
 */
export const getContractorRequest = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'contractorRequest'>, QueryContractorRequestArgs>(
    gql`
      query GetContractorRequest($id: ID!) {
        contractorRequest(id: $id) {
          id
          reason
          status
          adminComment
          user {
            id
            username
            email
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
      id: `/contractor_requests/${id}`,
    },
  );
};

/**
 * Create a contractor request.
 */
export const createContractorRequest = async (
  client: GraphQLClient,
  input: Omit<CreateContractorRequestInput, 'clientMutationId'>,
) => {
  return client.request<
    Pick<Mutation, 'createContractorRequest'>,
    MutationCreateContractorRequestArgs
  >(
    gql`
      mutation CreateContractorRequest($input: createContractorRequestInput!) {
        createContractorRequest(input: $input) {
          contractorRequest {
            id
            reason
            status
            adminComment
            user {
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
 * Update a contractor request.
 */
export const updateContractorRequest = async (
  client: GraphQLClient,
  input: Omit<UpdateContractorRequestInput, 'clientMutationId'>,
) => {
  return client.request<
    Pick<Mutation, 'updateContractorRequest'>,
    MutationUpdateContractorRequestArgs
  >(
    gql`
      mutation UpdateContractorRequest($input: updateContractorRequestInput!) {
        updateContractorRequest(input: $input) {
          contractorRequest {
            id
            reason
            status
            adminComment
            user {
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
 * Delete a contractor request.
 */
export const deleteContractorRequest = async (client: GraphQLClient, id: string) => {
  return client.request<
    Pick<Mutation, 'deleteContractorRequest'>,
    MutationDeleteContractorRequestArgs
  >(
    gql`
      mutation DeleteContractorRequest($input: deleteContractorRequestInput!) {
        deleteContractorRequest(input: $input) {
          contractorRequest {
            id
          }
        }
      }
    `,
    {
      input: {
        id: `/contractor_requests/${id}`,
      },
    },
  );
};
