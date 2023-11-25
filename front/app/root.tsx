import * as Checkbox from '@radix-ui/react-checkbox';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import * as RadixToast from '@radix-ui/react-toast';
import { Heading, Select, Text, Theme } from '@radix-ui/themes';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction } from '@remix-run/node';
import {
  Form,
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
  useSubmit,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import cl from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next';

import tailwindStylesheet from '~/styles/tailwind.css';
import themeStylesheet from '~/styles/theme.css';
import { Link } from '~components/Link';
import { ProgressBar } from '~components/ProgressBar';
import { Toast } from '~components/Toast';
import { FieldSelect } from '~components/form/FieldSelect';
import { SubmitButton } from '~components/form/SubmitButton';
import { darkModeCookie, localeCookie } from '~lib/cookies.server';
import { i18next } from '~lib/i18n/index.server';
import { commitSession, getSession } from '~lib/session.server';
import { preferencesValidationSchema } from '~lib/validators/locale';
import { ALLOWED_LOCALES, getLocaleLabel } from '~utils/locale';

import type { ActionFunctionArgs, DataFunctionArgs } from '@remix-run/node';

export type FlashMessage = {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  content: string;
};

export const FLASH_MESSAGE_KEY = 'flash-message' as const;

export async function loader({ request, context }: DataFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const flashMessage = session.get(FLASH_MESSAGE_KEY) as FlashMessage | undefined;

  return json(
    {
      env: {
        SENTRY_DSN: process.env.SENTRY_DSN,
      },
      flashMessage,
      user: context.user,
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
];

export let handle = {
  i18n: ['common'],
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
  const { flashMessage, user, locale, useDarkMode } = useLoaderData<Loader>();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const submit = useSubmit();
  const [toastOpen, setToastOpen] = useState(false);
  const [isChangingPreferences, setIsChangingPreferences] = useState(false);

  // Automatically reload t when the locale changes
  useChangeLanguage(locale);

  useEffect(() => {
    if (flashMessage && flashMessage.content.trim() !== '') {
      setToastOpen(true);
    }
  }, [flashMessage]);

  useEffect(() => {
    setIsChangingPreferences(false);
  }, [locale, useDarkMode]);

  return (
    <html
      lang={locale}
      dir={i18n.dir()}
      className={cl({ dark: useDarkMode })}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full min-w-full">
        <Theme accentColor="sky" grayColor="slate" appearance={useDarkMode ? 'dark' : 'light'}>
          <ProgressBar
            id="global-progress-bar"
            active={navigation.state === 'loading'}
            loadingMessage={t('page_loading')}
          />
          <RadixToast.Provider swipeDirection="right">
            <header className="sticky top-0 z-10 grid grid-cols-[max-content_auto] items-center justify-between gap-x-4 gap-y-2 bg-slate-1 p-4 shadow-6 sm:grid-cols-[auto_max-content_max-content] sm:justify-normal">
              <Link to="/" className="w-fit text-7" unstyled>
                Symmetrical Potato
              </Link>
              <nav>
                <ul className="flex items-center gap-4">
                  {user && (
                    <>
                      <li>Logged in as {user.username}</li>
                      <li>
                        <Link to="/dashboard" prefetch="intent">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Form method="post" action="/logout">
                          <SubmitButton text={t('logout')} />
                        </Form>
                      </li>
                    </>
                  )}
                  {!user && (
                    <li>
                      <Link to="/login" prefetch="intent">
                        {t('login')}
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
              <Form
                method="post"
                className="col-span-full flex items-center justify-end gap-4 sm:col-span-1"
                onChange={(event) => {
                  setIsChangingPreferences(true);
                  submit(event.currentTarget, {
                    navigate: false,
                    unstable_viewTransition: true,
                  });
                }}
              >
                <FieldSelect
                  name="locale"
                  required
                  label={t('change_locale')}
                  hideLabel
                  defaultValue={locale}
                  disabled={isChangingPreferences}
                >
                  <Select.Content>
                    {ALLOWED_LOCALES.map((allowedLocale) => (
                      <Select.Item key={allowedLocale} value={allowedLocale}>
                        {getLocaleLabel(allowedLocale)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </FieldSelect>
                <Checkbox.Root
                  aria-label={t('enable_dark_mode')}
                  defaultChecked={useDarkMode}
                  disabled={isChangingPreferences}
                  name="darkMode"
                  value="true"
                >
                  {useDarkMode ? (
                    <MoonIcon width="24" height="24" />
                  ) : (
                    <SunIcon width="24" height="24" />
                  )}
                </Checkbox.Root>
                <noscript>
                  <SubmitButton text={t('submit')} />
                </noscript>
              </Form>
            </header>

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
            {/* TODO look at this for better toasts */}
            <RadixToast.Viewport />
            <Outlet />
          </RadixToast.Provider>
        </Theme>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={3001} />
      </body>
    </html>
  );
}
