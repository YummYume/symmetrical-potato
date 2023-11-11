import { Heading } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';

import { denyAccessUnlessGranted } from '~utils/security.server';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  return {
    user,
  };
}

export type Loader = typeof loader;

export let handle = {
  i18n: ['common'],
};

export default function Dashboard() {
  const { user } = useLoaderData<Loader>();

  return (
    <div className="relative w-full">
      <Heading as="h1">Hi {user.username}</Heading>
      <img
        className="absolute right-0 top-20"
        src="/favicon.ico"
        alt="Remix Logo"
        style={{
          viewTransitionName: 'logo',
        }}
      />
    </div>
  );
}
