import { type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { denyAccessUnlessGranted } from '~utils/security';

export async function loader({ context }: LoaderArgs) {
  denyAccessUnlessGranted(context.user);

  return {
    user: context.user,
  };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="relative w-full">
      <h1>Hi {user.username}</h1>
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
