import { Container, Heading, ScrollArea, Section } from '@radix-ui/themes';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { getContractorRequests } from '~/lib/api/contractor-request';
import { NavLink } from '~/lib/components/Link';
import { ContractorRequestStatusBadge } from '~/lib/components/contractor_request/ContractorRequestStatusBadge';
import { i18next } from '~/lib/i18n/index.server';
import { getUriId } from '~/lib/utils/path';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, 'admin');
  const response = await getContractorRequests(context.client);

  return {
    contractorRequests: response.contractorRequests,
    meta: {
      title: t('meta.contractor_requests.title', {
        ns: 'admin',
      }),
      description: t('meta.contractor_requests.description', {
        ns: 'admin',
      }),
    },
  };
}

export type Loader = typeof loader;

export const meta: MetaFunction<Loader> = ({ data }) => {
  if (!data) {
    return [];
  }

  return [
    { title: data.meta.title },
    { name: 'description', content: data.meta.description },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export default function ContractorRequests() {
  const { contractorRequests } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <main className="py-10">
      <Heading align="center" as="h1" size="9">
        {t('contractor_requests')}
      </Heading>

      <Section>
        <Container>
          <div className="panel">
            <div className="panel__sidebar">
              <ScrollArea type="auto" scrollbars="both">
                <nav className="panel__sidebar-list">
                  <ul>
                    {contractorRequests.edges.map((edge) => (
                      <li key={edge.node.id}>
                        <NavLink
                          to={getUriId(edge.node.id)}
                          className="panel__sidebar-item group"
                          unstyled
                        >
                          {({ isActive, isPending }) => (
                            <>
                              <span>{edge.node.user.username}</span>
                              <ContractorRequestStatusBadge
                                status={edge.node.status}
                                variant="solid"
                              />
                              <div
                                className={clsx('panel__sidebar-item-background', {
                                  'panel__sidebar-item-background--active': isActive,
                                  'panel__sidebar-item-background--pending': isPending,
                                })}
                                aria-hidden="true"
                                style={{
                                  viewTransitionName: isActive
                                    ? 'active-contractor_request-link'
                                    : undefined,
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
