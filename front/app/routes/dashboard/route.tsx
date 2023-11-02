import { redirect, type LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ context }: LoaderArgs) {
  if (!context.user) {
    throw redirect('/login');
  }

  return {
    user: context.user,
  };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return <h1>Hi {user.username}</h1>;
}
