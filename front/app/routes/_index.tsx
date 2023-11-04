import { type MetaFunction } from '@remix-run/node';

import { Link } from '~components/Link';

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  return (
    <div className="font-sans leading-3">
      <h1 className="text-2xl">Welcome to Remix</h1>
      <ul className="flex flex-col gap-4">
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
      </ul>

      <img
        className="my-8"
        src="/favicon.ico"
        alt="Remix Logo"
        style={{
          viewTransitionName: 'logo',
        }}
      />

      <p className="mb-2 font-bold">
        {/* Maybe linked to https://github.com/remix-run/remix/issues/4183 ? */}
        BUG: This link should redirect to /login when not logged in :
      </p>
      <Link to="/dashboard">To dashboard</Link>
    </div>
  );
}
