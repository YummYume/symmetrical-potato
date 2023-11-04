import '@remix-run/node';

import type { DataFunctionArgs } from '@remix-run/node';
import type { GraphQLClient } from 'graphql-request';
import type { User } from '~api/types';

/**
 * The default context for all requests. User can be null.
 */
type PublicContext = {
  client: GraphQLClient;
  user: User | null;
};

/**
 * The context for protected routes. User is guaranteed to be defined.
 */
type ProtectedContext = PublicContext & {
  user: User;
};

declare module '@remix-run/node' {
  /**
   * Action arguments for public routes. Should be used in non-protected routes/layouts.
   */
  export interface PublicLoaderArgs extends DataFunctionArgs {
    context: PublicContext;
  }

  /**
   * Loader arguments for protected routes. Should be used in protected routes as user is guaranteed to be defined.
   */
  export interface LoaderArgs extends DataFunctionArgs {
    context: ProtectedContext;
  }

  /**
   * Action arguments for public routes. Should be used in non-protected routes/layouts.
   */
  export interface PublicActionArgs extends DataFunctionArgs {
    context: PublicContext;
  }

  /**
   * Action arguments for protected routes. Should be used in protected routes as user is guaranteed to be defined.
   */
  export interface ActionArgs extends DataFunctionArgs {
    context: ProtectedContext;
  }
}
