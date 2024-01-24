import * as RadixToast from '@radix-ui/react-toast';
import { Heading, Text, Theme } from '@radix-ui/themes';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next';

import tailwindStylesheet from '~/styles/tailwind.css';
import themeStylesheet from '~/styles/theme.css';
import viewTransitionsStylesheet from '~/styles/view-transitions.css';
import { Link } from '~components/Link';
import { ProgressBar } from '~components/ProgressBar';
import { Toast } from '~components/Toast';
import { ThemeContext } from '~lib/context/Theme';
import { darkModeCookie, localeCookie } from '~lib/cookies.server';
import { i18next } from '~lib/i18n/index.server';
import { commitSession, getSession } from '~lib/session.server';
import { preferencesValidationSchema } from '~lib/validators/locale';

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export type FlashMessage = {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  content: string;
};

export const FLASH_MESSAGE_KEY = 'flash-message' as const;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const flashMessage = session.get(FLASH_MESSAGE_KEY) as FlashMessage | undefined;

  return json(
    {
      env: {
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        SENTRY_DSN: process.env.SENTRY_DSN,
      },
      flashMessage,
      locale: context.locale,
      useDarkMode: context.useDarkMode,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
}

export type Loader = typeof loader;

export async function action({ request }: ActionFunctionArgs) {
  const t = await i18next.getFixedT(request, ['login', 'validators']);
  const result = preferencesValidationSchema.safeParse(await request.formData());
  const session = await getSession(request.headers.get('Cookie'));

  if (!result.success) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: t(result.error.message, { ns: 'validators' }),
      type: 'error',
    } as FlashMessage);

    return json(
      {},
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  }

  const headers = new Headers();

  headers.append('Set-Cookie', await localeCookie.serialize(result.data.locale));
  headers.append(
    'Set-Cookie',
    await darkModeCookie.serialize(result.data.darkMode ? 'true' : 'false'),
  );

  return json({}, { headers });
}

export type Action = typeof action;

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindStylesheet },
  { rel: 'stylesheet', href: themeStylesheet },
  { rel: 'stylesheet', href: viewTransitionsStylesheet },
];

export let handle = {
  i18n: ['common', 'login', 'register', 'validators', 'visitor', 'admin', 'flash', 'response'],
};

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (process.env.NODE_ENV === 'production' && isRouteErrorResponse(error) && error.status >= 500) {
    captureRemixErrorBoundaryError(error);
  } else if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <Heading as="h1">{error.status}</Heading>
        <Text as="p">{error.statusText}</Text>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  // TODO: Render a custom error page here
  return <div>Something went wrong</div>;
};

export default function App() {
  const { flashMessage, locale, useDarkMode } = useLoaderData<Loader>();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [toastOpen, setToastOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useChangeLanguage(locale);

  useEffect(() => {
    if (flashMessage && flashMessage.content.trim() !== '') {
      setToastOpen(true);
    }
  }, [flashMessage]);

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      className={clsx('min-h-screen', { dark: useDarkMode })}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen min-w-full">
        <Theme
          accentColor="sky"
          grayColor="slate"
          appearance={useDarkMode ? 'dark' : 'light'}
          ref={themeRef}
          className="min-h-screen min-w-full"
        >
          <ProgressBar
            id="global-progress-bar"
            active={navigation.state === 'loading'}
            loadingMessage={t('page_loading')}
          />
          <ThemeContext.Provider value={themeRef}>
            <RadixToast.Provider swipeDirection="right">
              {flashMessage && (
                <Toast
                  content={flashMessage.content}
                  title={flashMessage.title}
                  open={toastOpen}
                  onOpenChange={(open) => {
                    setToastOpen(open);
                  }}
                />
              )}
              <RadixToast.Viewport className="fixed bottom-0 right-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-[10px] p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
              <Outlet />
            </RadixToast.Provider>
          </ThemeContext.Provider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={3001} />
      </body>
    </html>
  );
}
