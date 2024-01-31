import { Box, Card, Flex, Tabs, Text } from '@radix-ui/themes';
import { redirect, useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';

import { getAssets } from '~/lib/api/asset';
import { getCrewMemberByUserAndHeist } from '~/lib/api/crew-member';
import { AssetTypeEnum } from '~/lib/api/types';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Asset as AssetItem } from '~/lib/api/types';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    const crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heist: params.heistId,
      user: user.id,
    });
    const { assets } = await getAssets(context.client);

    return {
      crewMember,
      assets: assets.edges.reduce<Record<AssetTypeEnum, AssetItem[]>>(
        (acc, curr) => {
          acc[curr.node.type].push(curr.node);
          return acc;
        },
        {
          [AssetTypeEnum.Asset]: [],
          [AssetTypeEnum.Weapon]: [],
          [AssetTypeEnum.Equipment]: [],
        },
      ),
      user,
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'assets')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: t('not_found', { ns: 'response' }),
    });
  }
}

export type Loader = typeof loader;

export async function action({ request, context, params }: ActionFunctionArgs) {}

const AssetCard = ({ asset }: { asset: AssetItem }) => (
  <Card style={{ maxWidth: 240 }}>
    <Box>
      <Flex gap="3" justify="between">
        <Text as="div" size="2" weight="bold">
          {asset.name}
        </Text>
        <Text as="div" size="2" color="gray">
          0/5
        </Text>
      </Flex>
    </Box>
  </Card>
);

export default function Asset() {
  const { t } = useTranslation();
  const { assets, crewMember } = useLoaderData<Loader>();

  const weapons = assets[AssetTypeEnum.Weapon] as AssetItem[];
  const equipments = assets[AssetTypeEnum.Equipment] as AssetItem[];
  const assetItems = assets[AssetTypeEnum.Asset] as AssetItem[];

  return (
    <Tabs.Root defaultValue="employee">
      <Tabs.List>
        <Tabs.Trigger value="employee">{t('employee')}</Tabs.Trigger>
        <Tabs.Trigger value="assets">{t('asset.type.assets')}</Tabs.Trigger>
        <Tabs.Trigger value="weapons">{t('asset.type.weapons')}</Tabs.Trigger>
        <Tabs.Trigger value="equipments">{t('asset.type.equipments')}</Tabs.Trigger>
      </Tabs.List>

      <Box px="4" pt="3" pb="2">
        <Tabs.Content value="employee">
          <Text size="2">Let's choose the one who will help you in your journey</Text>
        </Tabs.Content>

        <Tabs.Content value="assets">
          <Text size="2">{t('asset.type.assets.catch_phrase')}</Text>
          {assetItems.map((asset, index) => (
            <AssetCard key={`asset-${index}`} asset={asset} />
          ))}
        </Tabs.Content>

        <Tabs.Content value="weapons">
          <Text size="2">{t('asset.type.weapons.catch_phrase')}</Text>
          {weapons.map((asset, index) => (
            <AssetCard key={`weapon-${index}`} asset={asset} />
          ))}
        </Tabs.Content>

        <Tabs.Content value="equipments">
          <Text size="2">{t('asset.type.equipments.catch_phrase')}</Text>
          {equipments.map((asset, index) => (
            <AssetCard key={`equipment-${index}`} asset={asset} />
          ))}
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
