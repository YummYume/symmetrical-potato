import { gql, type GraphQLClient } from 'graphql-request';

import type {
  CreateReviewInput,
  Mutation,
  Query,
  UpdateReviewInput,
  QueryReviewsArgs,
} from '~api/types';

/**
 * Get a review
 */
export const getReview = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Query, 'review'>>(
    gql`
      query ($id: ID!) {
        review(id: $placeId) {
          id
          rating
          comment
        }
      }
    `,
    { id },
  );
};

export const getReviewByLocationAndUser = async (
  client: GraphQLClient,
  input: {
    placeId: string;
    userId: string;
  },
) => {
  return client.request<
    Pick<Query, 'review'>,
    {
      placeId: string;
      userId: string;
    }
  >(
    gql`
      query reviews($placeId: string!, $userId: string!) {
        review(location__placeId: $placeId, user: $userId) {
          id
          rating
          comment
        }
      }
    `,
    { placeId: input.placeId, userId: input.userId },
  );
};

/**
 * Create a review
 */
export const createReview = async (
  client: GraphQLClient,
  input: Omit<CreateReviewInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'createReview'>>(
    gql`
      mutation CreateReview($input: createReviewInput!) {
        createReview(input: $input) {
          review {
            id
          }
        }
      }
    `,
    {
      input: {
        ...input,
        estqablishment: input.establishment ? `/establishments/${input.establishment}` : null,
        location: input.location ? `/locations/${input.location}` : null,
      },
    },
  );
};

/**
 * Update a review
 */
export const updateReview = async (
  client: GraphQLClient,
  input: Omit<UpdateReviewInput, 'clientMutationId'>,
) => {
  return client.request<Pick<Mutation, 'updateReview'>>(
    gql`
      mutation UpdateReview($input: updateReviewInput!) {
        updateReview(input: $input) {
          review {
            id
          }
        }
      }
    `,
    {
      input: {
        ...input,
        id: `/reviews/${input.id}`,
      },
    },
  );
};

/**
 * Delete a review
 */
export const deleteReview = async (client: GraphQLClient, id: string) => {
  return client.request<Pick<Mutation, 'deleteReview'>>(
    gql`
      mutation DeleteReview($id: ID!) {
        deleteReview(input: { id: $id }) {
          review {
            id
          }
        }
      }
    `,
    { id: `/reviews/${id}` },
  );
};

/**
 * Get the reviews for an establishment.
 */
export const getReviewsForEstablishment = async (
  client: GraphQLClient,
  establishmentId: string,
) => {
  return client.request<Pick<Query, 'reviews'>, QueryReviewsArgs>(
    gql`
      query ($establishment__id: Iterable) {
        reviews(establishment__id: $establishment__id) {
          edges {
            node {
              id
              rating
              comment
              createdAt
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
      establishment__id: [`/establishments/${establishmentId}`],
    },
  );
};
