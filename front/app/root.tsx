import * as RadixToast from '@radix-ui/react-toast';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction } from '@remix-run/node';
import {
  Form,
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
  useSubmit,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { useTranslation } from 'react-i18next';
import { useChangeLanguage } from 'remix-i18next';

import tailwindStylesheet from '~/styles/tailwind.css';
import { Link } from '~components/Link';
import { ProgressBar } from '~components/ProgressBar';
import { Toast } from '~components/Toast';
import { SubmitButton } from '~components/form/SubmitButton';
import { localeCookie } from '~lib/cookies.server';
import { i18next } from '~lib/i18n/index.server';
import { commitSession, getSession } from '~lib/session.server';
import { localeValidationSchema } from '~lib/validators/locale';
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
  const result = localeValidationSchema.safeParse(await request.formData());
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

  return json(
    {},
    {
      headers: {
        'Set-Cookie': await localeCookie.serialize(result.data.locale),
      },
    },
  );
}

export type Action = typeof action;

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
  { rel: 'stylesheet', href: tailwindStylesheet },
];

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
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  // TODO: Render a custom error page here
  return <div>Something went wrong</div>;
};

export let handle = {
  i18n: ['common'],
};

export default function App() {
  const { flashMessage, user, locale } = useLoaderData<Loader>();
  const navigation = useNavigation();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const submit = useSubmit();

  useChangeLanguage(locale);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full min-w-full">
        <ProgressBar
          id="global-progress-bar"
          key={location.key}
          active={navigation.state === 'loading'}
          loadingMessage={t('page_loading')}
          className="fixed left-0 top-0 z-50 h-0.5 w-full rounded-b-full bg-transparent"
        />
        <RadixToast.Provider swipeDirection="right">
          <header className="flex flex-col justify-between border-b border-b-slate-700 p-4 lg:flex-row lg:items-center">
            <Link to="/">Symmetrical Potato</Link>
            <nav className="flex flex-col gap-2 lg:flex-row lg:gap-4">
              <Form
                method="post"
                navigate={false}
                className="flex flex-col gap-2 lg:flex-row"
                onChange={(event) => {
                  submit(event.currentTarget, {
                    navigate: false,
                  });
                }}
              >
                <select name="locale" defaultValue={locale}>
                  {ALLOWED_LOCALES.map((locale) => (
                    <option key={locale} value={locale}>
                      {getLocaleLabel(locale)}
                    </option>
                  ))}
                </select>
                <noscript>
                  <SubmitButton text={t('change_locale')} />
                </noscript>
              </Form>
              <ul className="flex flex-col gap-2 lg:flex-row">
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
          </header>
          {flashMessage && <Toast content={flashMessage.content} title={flashMessage.title} />}
          {/* TODO look at this for better toasts */}
          <RadixToast.Viewport />
          <Outlet />
        </RadixToast.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload port={3001} />
      </body>
    </html>
  );
}
