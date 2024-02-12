import { Pencil2Icon } from '@radix-ui/react-icons';
import { Container, Flex, Heading, Switch, Table, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getEmployeesForContractor } from '~/lib/api/employee';
import { EmployeeStatusEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import Schedule, { DAYS } from '~/lib/components/Schedule';
import { UserHoverCard } from '~/lib/components/user/UserHoverCard';
import { i18next } from '~/lib/i18n/index.server';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { truncate } from '~/lib/utils/string';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.CONTRACTOR]);

  const t = await i18next.getFixedT(request, 'common');
  const { employees } = await getEmployeesForContractor(context.client, getUriId(user.id));

  return {
    employees: employees.edges,
    meta: {
      title: t('meta.my_employees.title'),
      description: t('meta.my_employees.description'),
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

export default function Employees() {
  const { employees } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const filteredEmployees = useMemo(() => {
    if (showOnlyPending) {
      return employees.filter(({ node }) => node.status === EmployeeStatusEnum.Pending);
    }

    return employees;
  }, [employees, showOnlyPending]);
  const planning = useMemo(() => {
    return DAYS.map((day) => {
      const dayPlannings = employees.map(({ node }) => {
        const dayPlanning = node.planning[day] ?? [];

        return {
          name: node.codeName,
          hours: dayPlanning,
        };
      });

      return {
        name: day,
        employees: dayPlannings,
      };
    });
  }, [employees]);

  return (
    <main className="py-10">
      <Container className="space-y-16">
        <Heading align="center" as="h1" size="9">
          {t('my_employees')}
        </Heading>

        <section className="space-y-3 pb-10 pt-20">
          <Flex justify="between" align="center">
            <Heading as="h2" size="6">
              {t('my_employees.all')}
            </Heading>
            <Text as="label" size="2">
              <Flex gap="2">
                <Switch checked={showOnlyPending} onCheckedChange={setShowOnlyPending} />{' '}
                {t('my_employees.show_only_pending')}
              </Flex>
            </Text>
          </Flex>

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="whitespace-nowrap">
                  {t('employee.code_name')}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="whitespace-nowrap">
                  {t('user')}
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{t('employee.status')}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{t('employee.motivation')}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>{t('description')}</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  <span className="sr-only">{t('edit')}</span>
                </Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredEmployees.map(({ node }) => (
                <Table.Row key={node.id}>
                  <Table.RowHeaderCell className="whitespace-nowrap">
                    {node.codeName}
                  </Table.RowHeaderCell>
                  <Table.RowHeaderCell className="whitespace-nowrap">
                    <UserHoverCard
                      username={node.user.username}
                      description={node.user.profile?.description}
                      globalRating={node.user.globalRating}
                      mainRole={node.user.mainRole}
                    >
                      <Link to={`/users/${node.user.id}`}>{node.user.username}</Link>
                    </UserHoverCard>
                  </Table.RowHeaderCell>
                  <Table.Cell>{t(`employee.status.${node.status.toLowerCase()}`)}</Table.Cell>
                  <Table.Cell>{node.motivation && truncate(node.motivation, 100)}</Table.Cell>
                  <Table.Cell>{node.description && truncate(node.description, 100)}</Table.Cell>
                  <Table.Cell>
                    <Link aria-label={t('edit')} to={getUriId(node.id)}>
                      <Pencil2Icon className="size-6" />
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </section>

        <section className="space-y-3">
          <Heading as="h2" size="6">
            {t('my_employees.full_schedule')}
          </Heading>
          <Schedule days={planning} />
        </section>
      </Container>
    </main>
  );
}
