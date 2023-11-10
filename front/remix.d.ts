import '@remix-run/node';

import type { GraphQLClient } from 'graphql-request';
import type { User } from '~api/types';
import type { Locale } from '~utils/locale';

declare module '@remix-run/node' {
  export interface AppLoadContext {
    client: GraphQLClient;
    user: User | null;
    locale: Locale;
  }
}
