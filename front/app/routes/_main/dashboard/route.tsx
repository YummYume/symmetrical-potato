import { Card, Container, Flex, Heading, Section, Text } from '@radix-ui/themes';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getDayHeists } from '~/lib/api/heist';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { Link } from '~components/Link';

import type { DataFunctionArgs } from '@remix-run/node';

export async function loader({ context }: DataFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  try {
    const response = await getDayHeists(context.client);

    console.log(response);

    return {
      heists: response.heists?.edges ?? [],
      locale: context.locale,
      pageInfo: response.heists?.pageInfo ?? null,
      user: context.user,
    };
  } catch (e) {
    console.error(e);
  }

  return {
    heists: [],
    locale: context.locale,
    pageInfo: null,
    user: context.user,
  };
}

export type Loader = typeof loader;

export default function Dashboard() {
  const { t } = useTranslation();

  const { heists, locale, user } = useLoaderData<Loader>();

  const isHeister = useMemo(() => user?.roles.includes('ROLE_HEISTER'), [user?.roles]);

  console.log(heists);

  return (
    <Section className="space-y-16">
      <Heading align="center" as="h1" size="9">
        {t('dashboard')}
      </Heading>
      <Container className="space-y-3">
        {heists
          .filter((heist) => (isHeister ? heist?.node?.crewMembers?.totalCount ?? 0 <= 4 : true))
          .map((heist) => {
            if (heist?.node) {
              const { crewMembers, id, name, startAt } = heist.node;

              return (
                <Card asChild key={id}>
                  <Link to="/">
                    <Flex justify="between">
                      <div>
                        <Text as="p" size="2" weight="bold">
                          {name}
                        </Text>
                        <Text as="p" color="gray" size="2">
                          Starting today at{' '}
                          {new Date(startAt).toLocaleTimeString(locale, {
                            hour: 'numeric',
                            minute: 'numeric',
                          })}
                        </Text>
                      </div>
                      <Text as="p" size="2" weight="bold">
                        {crewMembers?.totalCount}
                        <span> / 4</span>
                      </Text>
                    </Flex>
                  </Link>
                </Card>
              );
            }

            return null;
          })}
      </Container>
    </Section>
  );
}
