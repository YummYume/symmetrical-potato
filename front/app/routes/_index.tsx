import { json, type LoaderArgs, type MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';

import { commitSession, getSession } from '~/lib/session.server';

export const loader = async ({ request, context }: LoaderArgs) => {
  const session = await getSession(request.headers.get('Cookie'));

  return json(
    {
      user: context.user,
      flashes: session.flash,
    },
    {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    },
  );
};

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1 className="text-2xl">Welcome to Remix</h1>
      <ul>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
        {user && <li>Logged in as {user.username}</li>}
        {!user && (
          <li>
            <Link to="/login" prefetch="intent">
              Login
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
