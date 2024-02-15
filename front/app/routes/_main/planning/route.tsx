import { Container, Flex, Heading } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getEmployee } from '~/lib/api/employee';
import Schedule, { DAYS } from '~/lib/components/Schedule';
import { i18next } from '~/lib/i18n/index.server';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';

import type { MetaFunction } from '@remix-run/node';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!hasRoles(user, [ROLES.EMPLOYEE]) || !user.employee.id) {
    throw redirect('/dashboard');
  }

  const t = await i18next.getFixedT(request, 'common');
  const { employee } = await getEmployee(context.client, user.employee.id);

  return {
    employee,
    meta: {
      title: t('meta.planning.title'),
      description: t('meta.planning.description'),
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

export default function Planning() {
  const { employee } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const planning = useMemo(() => {
    return DAYS.map((day) => {
      const dayPlanning = employee.planning[day] ?? [];

      return {
        name: day,
        employees: [
          {
            name: employee.codeName,
            hours: dayPlanning,
          },
        ],
      };
    });
  }, [employee]);

  return (
    <main className="px-4 py-10 lg:px-0">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {t('my_planning')}
          </Heading>
          <Schedule days={planning} />
        </Flex>
      </Container>
    </main>
  );
}
