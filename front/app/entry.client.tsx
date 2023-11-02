import { RemixBrowser, useLocation, useMatches } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { getEnv, setEnv } from '~utils/env.client';

import type { loader as rootLoader } from './root';
import type { SerializeFrom } from '@remix-run/node';

/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

const rootData = __remixContext.state.loaderData?.root as
  | SerializeFrom<typeof rootLoader>
  | undefined;

if (rootData) {
  Object.entries(rootData.env).forEach(([key, value]) => {
    setEnv(key, value);
  });
}

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: getEnv('SENTRY_DSN'),
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,

    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.remixRouterInstrumentation(
          useEffect,
          useLocation,
          useMatches,
        ),
      }),
      new Sentry.Replay(),
    ],
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  );
});
