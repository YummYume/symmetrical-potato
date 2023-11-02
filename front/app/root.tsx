import * as RadixToast from '@radix-ui/react-toast';
import { cssBundleHref } from '@remix-run/css-bundle';
import { json, type LinksFunction, type LoaderArgs } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';

import tailwindStylesheet from '~/styles/tailwind.css';
import { Toast } from '~components/Toast';
import { commitSession, getSession } from '~lib/session.server';

export type FlashMessage = {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  content: string;
};

export const FLASH_MESSAGE_KEY = 'flash-message' as const;

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const flashMessage = session.get(FLASH_MESSAGE_KEY) as FlashMessage | undefined;

  return json(
    {
      env: {
        SENTRY_DSN: process.env.SENTRY_DSN,
      },
      flashMessage,
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

  if (process.env.NODE_ENV === 'production') {
    captureRemixErrorBoundaryError(error);
  } else if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  // TODO: Render a custom error page here
  return <div>Something went wrong</div>;
};

export default function App() {
  const { flashMessage } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full min-w-full">
        <RadixToast.Provider swipeDirection="right">
          {flashMessage && <Toast content={flashMessage.content} title={flashMessage.title} />}
          <RadixToast.Viewport />
          <Outlet />
        </RadixToast.Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
