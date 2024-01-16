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
          <div className="panel">
            <div className="panel__sidebar">
              <ScrollArea type="auto" scrollbars="both">
                <nav className="panel__sidebar-list">
                  <ul>
                    {users.edges.map((edge) => (
                      <li key={edge.node.id}>
                        <NavLink
                          to={getUriId(edge.node.id)}
                          className="panel__sidebar-item group"
                          unstyled
                        >
                          {({ isActive, isPending }) => (
                            <>
                              <span>{edge.node.username}</span>
                              <UserStatusBadge status={edge.node.status} variant="solid" />
                              <div
                                className={clsx('panel__sidebar-item-background', {
                                  'panel__sidebar-item-background--active': isActive,
                                  'panel__sidebar-item-background--pending': isPending,
                                })}
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
            <div className="panel__content">
              <Outlet key={pathname} />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
