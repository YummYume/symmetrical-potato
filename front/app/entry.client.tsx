import { RemixBrowser } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import ICU from 'i18next-icu';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { getInitialNamespaces } from 'remix-i18next';

import { getEnv, setEnv } from '~/lib/utils/env';
import { config } from '~lib/i18n/config';

import type { Loader as RootLoader } from './root';
import type { SerializeFrom } from '@remix-run/node';

/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

const hydrate = async () => {
  const rootData = __remixContext.state.loaderData?.root as SerializeFrom<RootLoader> | undefined;

  if (rootData) {
    Object.entries(rootData.env).forEach(([key, value]) => {
      setEnv(key, value);
    });
  }

  const dsn = getEnv('SENTRY_DSN').trim();

  if (process.env.NODE_ENV === 'production' && !!dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [Sentry.replayIntegration()],
    });
  }

  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(HttpBackend)
    .use(ICU)
    .init({
      ...config,
      interpolation: {
        escapeValue: false,
      },
      ns: getInitialNamespaces(),
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
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
};

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
