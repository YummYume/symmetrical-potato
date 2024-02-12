import { Container, Flex, Heading } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getEmployee } from '~/lib/api/employee';
import Schedule, { DAYS } from '~/lib/components/Schedule';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted, hasRoles } from '~/lib/utils/security.server';

export async function loader({ context }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user);

  if (!hasRoles(user, [ROLES.EMPLOYEE]) || !user.employee.id) {
    throw redirect('/dashboard');
  }

  const { employee } = await getEmployee(context.client, user.employee.id);

  return {
    employee,
  };
}

export type Loader = typeof loader;

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
    <main className="py-10">
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
