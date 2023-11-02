import '@remix-run/node';

import type { DataFunctionArgs } from '@remix-run/node';
import type { GraphQLClient } from 'graphql-request';
import type { User } from '~api/types';

declare module '@remix-run/node' {
  export interface LoaderArgs extends DataFunctionArgs {
    context: { client: GraphQLClient; user: User | null };
  }

  export interface ActionArgs extends DataFunctionArgs {
    context: { client: GraphQLClient; user: User | null };
  }
}
