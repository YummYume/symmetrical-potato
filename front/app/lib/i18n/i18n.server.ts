import Backend from 'i18next-fs-backend';
import { RemixI18Next } from 'remix-i18next';

import { resolve } from 'node:path';

import i18nConfig from './i18nConfig';

let i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
  },
  i18next: {
    ...i18nConfig,
    backend: {
      loadPath: resolve('./public/locales/{{lng}}/{{ns}}.json'),
    },
  },
  plugins: [Backend],
});

export default i18next;
