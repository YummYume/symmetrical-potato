import * as RadixToast from '@radix-ui/react-toast';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction, type PublicLoaderArgs } from '@remix-run/node';
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
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import tailwindStylesheet from '~/styles/tailwind.css';
import { Link } from '~components/Link';
import { ProgressBar } from '~components/ProgressBar';
import { Toast } from '~components/Toast';
import { SubmitButton } from '~components/form/SubmitButton';
import { commitSession, getSession } from '~lib/session.server';

export type FlashMessage = {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  content: string;
};

export const FLASH_MESSAGE_KEY = 'flash-message' as const;

export async function loader({ request, context }: PublicLoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const flashMessage = session.get(FLASH_MESSAGE_KEY) as FlashMessage | undefined;

  return json(
    {
      env: {
        SENTRY_DSN: process.env.SENTRY_DSN,
      },
      flashMessage,
      user: context.user,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
}

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

export default function App() {
  const { flashMessage, user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const location = useLocation();

  return (
    <html lang="en">
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
          loadingMessage="Page is loading..."
          className="fixed left-0 top-0 z-50 h-0.5 w-full rounded-b-full bg-transparent"
        />
        <RadixToast.Provider swipeDirection="right">
          <header className="flex flex-col justify-between border-b border-b-slate-700 p-4 lg:flex-row lg:items-center">
            <Link to="/">Symmetrical Potato</Link>
            <nav>
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
                        <SubmitButton text="Logout" />
                      </Form>
                    </li>
                  </>
                )}
                {!user && (
                  <li>
                    <Link to="/login" prefetch="intent">
                      Login
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
