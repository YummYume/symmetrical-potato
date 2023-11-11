import { Heading, Link as RadixLink } from '@radix-ui/themes';
import { type MetaFunction } from '@remix-run/node';

import { Link } from '~components/Link';

export const meta: MetaFunction = () => {
  return [
    { title: 'Symmetrical Potato' },
    { name: 'description', content: 'The best looking potatoes, ever.' },
  ];
};

export let handle = {
  i18n: ['common'],
};

export default function Index() {
  return (
    <div className="leading-3">
      <Heading as="h1">Welcome to Remix</Heading>
      <ul className="flex flex-col gap-4">
        <li>
          <RadixLink target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
          </RadixLink>
        </li>
        <li>
          <RadixLink target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </RadixLink>
        </li>
        <li>
          <RadixLink target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </RadixLink>
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

      <Link to="/dashboard">To dashboard (redirect to login if not logged in)</Link>
    </div>
  );
}
