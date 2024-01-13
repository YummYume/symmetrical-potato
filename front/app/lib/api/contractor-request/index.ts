import { type GraphQLClient, gql } from 'graphql-request';

import type {
  Mutation,
  MutationDeleteContractorRequestArgs,
  MutationUpdateContractorRequestArgs,
  Query,
  UpdateContractorRequestInput,
} from '~api/types';

/**
 * Query all contractor requests.
 */
export const getContractorRequests = async (client: GraphQLClient) => {
  return client.request<Pick<Query, 'contractorRequests'>>(gql`
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
  `);
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
