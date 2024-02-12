import { Card, Container, Flex, Heading, Text } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getPublicUser } from '~/lib/api/user';
import { Rating } from '~/lib/components/Rating';
import { UserAvatar } from '~/lib/components/user/UserAvatar';
import { UserMainRoleBadge } from '~/lib/components/user/UserMainRoleBadge';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.userId) {
    throw new Response(null, {
      status: 404,
      statusText: 'user.not_found',
    });
  }

  try {
    const { user } = await getPublicUser(context.client, params.userId);
    const t = await i18next.getFixedT(request, 'common');

    return json({
      user,
      meta: {
        title: user.username,
        description: t('meta.profile.description', {
          name: user.username,
        }),
      },
    });
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'user')) {
      throw e;
    }
  }

  throw new Response(null, {
    status: 404,
    statusText: 'user.not_found',
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

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useLoaderData<Loader>();

  return (
    <main className="py-10">
      <Container>
        <Flex gap="9" direction="column">
          <Heading align="center" as="h1" size="9">
            {user.username}
          </Heading>

          <Card>
            <Flex
              direction={{ initial: 'column', md: 'row' }}
              gap={{ initial: '2', md: '4' }}
              className="p-2 md:p-0"
            >
              <Flex direction="row" gap={{ initial: '1', md: '2' }}>
                <Flex direction="column" gap="2" align="center">
                  <UserAvatar username={user.username} mainRole={user.mainRole} size="6" />
                  <UserMainRoleBadge mainRole={user.mainRole} />
                </Flex>
                <Text as="p" size="5">
                  {user.profile.description ?? t('user.no_description')}
                </Text>
              </Flex>
              {user.globalRating && (
                <Flex direction="column" gap="1" align="end">
                  <Text as="span" weight="bold" size="2">
                    {t('user.global_rating')}
                  </Text>
                  <Rating style={{ width: 125 }} value={user.globalRating} readOnly />
                </Flex>
              )}
            </Flex>
          </Card>
        </Flex>
      </Container>
    </main>
  );
}
