import { Container, Heading, ScrollArea, Section } from '@radix-ui/themes';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { UserStatusBadge } from '~/lib/components/user/UserStatusBadge';
import { getUriId } from '~/lib/utils/path';
import { getUsers } from '~api/user';
import { NavLink } from '~components/Link';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  const response = await getUsers(context.client);

  return {
    users: response.users,
  };
}

export type Loader = typeof loader;

export default function Users() {
  const { users } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <main className="py-10">
      <Heading align="center" as="h1" size="9">
        {t('users')}
      </Heading>

      <Section>
        <Container>
          <div className="grid h-[32rem] grid-cols-[25%_75%] overflow-hidden">
            <div className="h-[32rem] rounded-l-5 border-2 ">
              <ScrollArea type="auto" scrollbars="both">
                <nav>
                  <ul>
                    {users.edges.map((edge) => (
                      <li key={edge.node.id}>
                        <NavLink
                          to={getUriId(edge.node.id)}
                          className="group relative flex justify-between gap-1 p-5"
                          unstyled
                        >
                          {({ isActive, isPending }) => (
                            <>
                              <span>{edge.node.username}</span>
                              <UserStatusBadge status={edge.node.status} />
                              <div
                                className={clsx(
                                  'absolute inset-0 -z-10 transition-colors group-hover:bg-accent-8 group-focus-visible:bg-accent-8 motion-reduce:transition-none',
                                  {
                                    'bg-accent-8': isActive,
                                    'bg-accent-10 opacity-50': isPending,
                                  },
                                )}
                                aria-hidden="true"
                                style={{
                                  viewTransitionName: isActive ? 'active-user-link' : undefined,
                                }}
                              />
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </ScrollArea>
            </div>
            <div className="h-[32rem] rounded-r-5 border-2 border-l-0 p-4">
              <Outlet key={pathname} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
