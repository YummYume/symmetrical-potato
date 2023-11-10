import { ResolveAcceptLanguage } from 'resolve-accept-language';

import { localeCookie } from '~lib/cookies.server';

export const LOCALE_EN = 'en-GB' as const;
export const LOCALE_FR = 'fr-FR' as const;
export const DEFAULT_LOCALE = LOCALE_EN;
export const ALLOWED_LOCALES = [LOCALE_EN, LOCALE_FR] as const;

export type Locale = (typeof ALLOWED_LOCALES)[number];

/**
 * Return the locale from the cookie or the accept-language header.
 */
export const getLocale = async (cookie: string, acceptLanguage: string): Promise<Locale> => {
  const cookieLocale = await localeCookie.parse(cookie);

  if (ALLOWED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  const resolvedLanguage = new ResolveAcceptLanguage(
    acceptLanguage,
    ALLOWED_LOCALES,
    DEFAULT_LOCALE,
  );

  return resolvedLanguage.getMatch();
};

/**
 * Return the label for the given locale.
 */
export const getLocaleLabel = (locale: Locale) => {
  const labels = {
    [LOCALE_EN]: 'English',
    [LOCALE_FR]: 'Français',
  };

  return labels[locale];
};
