import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next';

import { resolve } from 'node:path';

import { config } from './config';

export const i18next = new RemixI18Next({
  detection: {
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
