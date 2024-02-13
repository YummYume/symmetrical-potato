import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';

import { getHeist } from '~/lib/api/heist';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { MetaFunction } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

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

  return <p>TODO</p>;
}
