import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next';

import { resolve } from 'node:path';

import { localeCookie } from '~lib/cookies.server';

import { config } from './config';

export const i18next = new RemixI18Next({
  detection: {
    order: ['cookie', 'header'],
    cookie: localeCookie,
    supportedLanguages: config.supportedLngs,
    fallbackLanguage: config.fallbackLng,
  },
  i18next: {
    ...config,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
  },
  plugins: [Backend],
});
