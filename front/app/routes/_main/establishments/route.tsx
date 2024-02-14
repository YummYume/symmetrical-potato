import { Pencil2Icon } from '@radix-ui/react-icons';
import { Container, Flex, Heading, Switch, Table, Text } from '@radix-ui/themes';
import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getEstablishments } from '~/lib/api/establishment';
import { Link } from '~/lib/components/Link';
import { Rating } from '~/lib/components/Rating';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';
import { truncate } from '~/lib/utils/string';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  const { establishments } = await getEstablishments(context.client);
  const t = await i18next.getFixedT(request, 'common');

  return json({
    user,
    isContractor: hasRoles(user, [ROLES.CONTRACTOR]),
    establishments: establishments.edges,
    meta: {
      title: t('meta.establishments.title'),
      description: t('meta.establishments.description'),
    },
  });
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

export default function Establishments() {
  const { establishments, user, isContractor } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [showOnlyOwner, setShowOnlyOwner] = useState(false);
  const filteredEstablishments = useMemo(() => {
    if (showOnlyOwner && isContractor) {
      return establishments.filter(({ node }) => node.contractor.id === user.id);
    }

    return establishments;
  }, [establishments, showOnlyOwner, user, isContractor]);

  return (
    <main className="px-4 py-10 lg:px-0">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('establishments')}
          </Heading>

          <Flex direction="column" gap="3">
            {isContractor && (
              <Flex justify="end">
                <Text as="label" size="2">
                  <Flex gap="2">
                    <Switch checked={showOnlyOwner} onCheckedChange={setShowOnlyOwner} />{' '}
                    {t('establishment.show_only_owner')}
                  </Flex>
                </Text>
              </Flex>
            )}

            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>{t('establishment.name')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>{t('user.role.contractor')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>{t('establishment.description')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.minimum_wage')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.minimum_work_time_per_week')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.contractor_cut')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.employee_cut')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.crew_cut')}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="whitespace-nowrap">
                    {t('establishment.average_rating')}
                  </Table.ColumnHeaderCell>
                  {isContractor && (
                    <Table.ColumnHeaderCell>
                      <span className="sr-only">{t('edit')}</span>
                    </Table.ColumnHeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredEstablishments.map(({ node }) => (
                  <Table.Row key={node.id}>
                    <Table.RowHeaderCell className="whitespace-nowrap">
                      <Link to={getUriId(node.id)}>{node.name}</Link>
                    </Table.RowHeaderCell>
                    <Table.Cell>
                      <UserHoverCard
                        username={node.contractor.username}
                        mainRole={node.contractor.mainRole}
                        description={node.contractor.profile?.description}
                        globalRating={node.contractor.globalRating}
                      >
                        <Link to={`/profile/${getUriId(node.contractor.id)}`}>
                          {node.contractor.username}
                        </Link>
                      </UserHoverCard>
                    </Table.Cell>
                    <Table.Cell>{truncate(node.description, 100)}</Table.Cell>
                    <Table.Cell>
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: 'USD',
                      }).format(node.minimumWage)}
                    </Table.Cell>
                    <Table.Cell>{node.minimumWorkTimePerWeek}</Table.Cell>
                    <Table.Cell>{node.contractorCut} %</Table.Cell>
                    <Table.Cell>{node.employeeCut} %</Table.Cell>
                    <Table.Cell>{node.crewCut} %</Table.Cell>
                    <Table.Cell>
                      <Rating value={node.averageRating} style={{ maxWidth: 100 }} readOnly />
                    </Table.Cell>
                    {isContractor && (
                      <Table.Cell>
                        {node.contractor.id === user.id && (
                          <Link
                            aria-label={t('edit')}
                            to={`/establishments/${getUriId(node.id)}/edit`}
                          >
                            <Pencil2Icon className="size-6" />
                          </Link>
                        )}
                      </Table.Cell>
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Flex>
        </Flex>
      </Container>
    </main>
  );
}
