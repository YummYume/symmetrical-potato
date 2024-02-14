import { PersonIcon } from '@radix-ui/react-icons';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Card, Flex, Heading, IconButton, Section, Text } from '@radix-ui/themes';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';

import { getHeist } from '~/lib/api/heist';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  denyAccessUnlessGranted(context.user);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    const { heist } = await getHeist(context.client, params.heistId);

    return {
      heist,
      placeId: params.placeId,
      meta: {
        title: heist.name,
        description: t('meta.heist.description', {
          address: heist.name,
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'heist')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: t('not_found', { ns: 'response' }),
    });
  }
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

export default function Heist() {
  const { heist } = useLoaderData<Loader>();

  console.log('heist', heist);

  return (
    <>
      <Section className="space-y-2" size="1">
        <Flex gap="2">
          <Heading as="h3" size="8">
            {heist.name}
          </Heading>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <IconButton className="items-center">
                  <span>{heist.crewMembers.edges.length}</span>

                  <PersonIcon />
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" sideOffset={5}>
                <Card>TEST</Card>
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </Flex>
        <Text as="p">{heist.description}</Text>
      </Section>
      <Section className="space-y-2" size="1"></Section>
    </>
  );
}
