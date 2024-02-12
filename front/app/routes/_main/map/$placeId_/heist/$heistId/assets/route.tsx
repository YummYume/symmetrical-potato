import * as Dialog from '@radix-ui/react-dialog';
import { Grid, Heading, Section } from '@radix-ui/themes';
import { redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { useTypedLoaderData } from 'remix-typedjson';

import { getHeistPartial } from '~/lib/api/heist';
import Popover from '~/lib/components/Popover';
import { AssetListItem } from '~/lib/components/asset/AssetListItem';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { hasPathError } from '~/lib/utils/api';
import { getUriId } from '~/lib/utils/path';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { FLASH_MESSAGE_KEY } from '~/root';

import AssetForm from './AssetForm';

import type { LoaderFunctionArgs } from '@remix-run/node';
import type { FlashMessage } from '~/root';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, ROLES.CONTRACTOR);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');
  const session = await getSession(request.headers.get('Cookie'));

  try {
    const { heist } = await getHeistPartial(
      context.client,
      params.heistId,
      `
      establishment {
        contractor {
          id
        }
      }
      assets {
        edges {
          node {
            id
            name
            price
            maxQuantity
            type
            description
            teamAsset
          }
        }
      }
      location {
        placeId
      }
    `,
    );

    if (
      heist.establishment.contractor.id === user.id &&
      heist.location.placeId === params.placeId
    ) {
      return {
        heist,
      };
    }
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'heist')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: t('not_found', { ns: 'response' }),
    });
  }

  session.flash(FLASH_MESSAGE_KEY, {
    content: t('heist.asset.cannot_access', { ns: 'flash' }),
    type: 'error',
  } as FlashMessage);

  throw redirect(`/map/${params.placeId}`, {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export type Loader = typeof loader;

export default function Assets() {
  const { t } = useTranslation();
  const { heist } = useTypedLoaderData<Loader>();

  const { assets } = heist;

  return (
    <Grid gap="3">
      <div>
        <Dialog.Title asChild>
          <Heading as="h2" size="8">
            {t('asset.title.plural')}
          </Heading>
        </Dialog.Title>
      </div>
      <Popover triggerChildren={t('heist.asset.add')}>
        <AssetForm heistId={getUriId(heist.id)} placeId={heist.location.placeId} />
      </Popover>
      <div>
        <Section className="space-y-3" size="1">
          <>
            {assets.edges.length > 0 ? (
              assets.edges.map(({ node }) => <AssetListItem key={node.id} asset={node} />)
            ) : (
              <p>{t('heist.asset.no_assets')}</p>
            )}
          </>
        </Section>
      </div>
    </Grid>
  );
}
