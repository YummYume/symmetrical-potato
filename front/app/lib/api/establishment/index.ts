import { gql, type GraphQLClient } from 'graphql-request';

import type { Query, QueryEstablishmentsArgs } from '~api/types';

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
