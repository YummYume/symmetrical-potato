import { RemixBrowser } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next';

import { config } from '~lib/i18n/config';
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
    integrations: [new Sentry.Replay()],
  });
}

await i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpBackend)
  .init({
    ...config,
    ns: getInitialNamespaces(),
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.yaml' },
    detection: {
      order: ['htmlTag'],
      caches: [],
    },
  });

startTransition(() => {
  hydrateRoot(
    document,
    <I18nextProvider i18n={i18next}>
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    </I18nextProvider>,
  );
});
