import { Container, Flex, Heading, Text } from '@radix-ui/themes';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getPublicUser } from '~/lib/api/user';
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
          <div className="md:flex md:justify-between md:space-x-5">
            <div className="flex items-start space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <UserAvatar username={user.username} mainRole={user.mainRole} size="6" />
                </div>
              </div>
              <div className="pt-1.5">
                <Text as="p" size="5">
                  {user.profile.description ?? t('user.no_description')}
                </Text>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
              <UserMainRoleBadge mainRole={user.mainRole} />
            </div>
          </div>
        </Flex>
      </Container>
    </main>
  );
}
