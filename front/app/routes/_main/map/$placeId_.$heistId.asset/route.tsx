import { Box, Button, Card, Flex, Grid, Tabs, Text } from '@radix-ui/themes';
import { redirect } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypedLoaderData } from 'remix-typedjson';

import { getAssets, getAssetsForbiddenForHeist } from '~/lib/api/asset';
import { getCrewMemberByUserAndHeist } from '~/lib/api/crew-member';
import { AssetTypeEnum } from '~/lib/api/types';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Asset as AssetItem, HeistAsset } from '~/lib/api/types';

type AssetsReduce = Record<
  AssetTypeEnum,
  {
    [key: string]: AssetItem;
  }
>;

type CrewMemberAssetsReduce = Record<
  AssetTypeEnum,
  {
    [key: string]: HeistAsset;
  }
>;

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    const crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });
    const { assets } = await getAssets(context.client);
    const { assets: assetsForbidden } = await getAssetsForbiddenForHeist(
      context.client,
      params.heistId,
    );

    const crewMemberAssets = crewMember?.heistAssets.edges.reduce<CrewMemberAssetsReduce>(
      (acc, curr) => {
        acc[curr.node.asset.type][curr.node.asset.name] = curr.node;
        return acc;
      },
      {
        [AssetTypeEnum.Asset]: {},
        [AssetTypeEnum.Weapon]: {},
        [AssetTypeEnum.Equipment]: {},
      },
    );

    return {
      crewMemberAssets,
      assets: assets.edges.reduce<AssetsReduce>(
        (acc, curr) => {
          if (!assetsForbidden.edges.some((edge) => edge.node.id === curr.node.id)) {
            acc[curr.node.type][curr.node.name] = curr.node;
          }

          return acc;
        },
        {
          [AssetTypeEnum.Asset]: {},
          [AssetTypeEnum.Weapon]: {},
          [AssetTypeEnum.Equipment]: {},
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

const AssetCard = ({ asset, quantity }: { asset: AssetItem; quantity?: number }) => (
  <Card className={`${quantity !== undefined ? '!border-green-6 !bg-green-3' : ''}`}>
    <Box>
      <Flex gap="3" justify="between">
        <Text as="div" size="2" weight="bold">
          {asset.name}
        </Text>
        <Text as="div" size="2" color="gray">
          {quantity ?? 0}/5
        </Text>
      </Flex>
    </Box>
  </Card>
);

type AssetProps = { id: string; quantity: number; crewMemberAssetId?: string };

export default function Asset() {
  const { t } = useTranslation();
  const { assets, crewMemberAssets } = useTypedLoaderData<Loader>();

  const [buyAssets, setBuyAssets] = useState<
    Record<
      'sell' | 'buy',
      {
        [key: string]: AssetProps;
      }
    >
  >({
    sell: {},
    buy: {},
  });

  useEffect(() => {
    console.log(buyAssets);
  }, [buyAssets]);

  const addAsset = ({ id, quantity, crewMemberAssetId }: AssetProps) => {
    setBuyAssets((prev) => ({
      ...prev,
      buy: { ...prev.buy, [id]: { id, quantity: quantity + 1, crewMemberAssetId } },
    }));
  };

  const removeAsset = ({ id, quantity, crewMemberAssetId }: AssetProps) => {
    setBuyAssets((prev) => {
      if (prev.buy[id]?.quantity - 1 <= 0) {
        const { [id]: _, ...rest } = prev.buy;
        return { ...prev, buy: rest };
      } else {
        return {
          ...prev,
          buy: {
            ...prev.buy,
            [id]: { id, quantity: prev.buy[id]?.quantity - 1, crewMemberAssetId },
          },
        };
      }
    });
  };

  // const weapons = assets[AssetTypeEnum.Weapon] as AssetsReduce[AssetTypeEnum.Weapon];
  // const equipments = assets[AssetTypeEnum.Equipment] as AssetsReduce[AssetTypeEnum.Equipment];
  // const assetItems = assets[AssetTypeEnum.Asset] as AssetsReduce[AssetTypeEnum.Asset];

  // const crewMemberWeapons =
  //   crewMemberAssets &&
  //   (crewMemberAssets[AssetTypeEnum.Weapon] as CrewMemberAssetsReduce[AssetTypeEnum.Weapon]);

  // const crewMemberEquipments =
  //   crewMemberAssets &&
  //   (crewMemberAssets[AssetTypeEnum.Equipment] as CrewMemberAssetsReduce[AssetTypeEnum.Equipment]);

  // const crewMemberAssetItems =
  //   crewMemberAssets &&
  //   (crewMemberAssets[AssetTypeEnum.Asset] as CrewMemberAssetsReduce[AssetTypeEnum.Asset]);

  return (
    <Tabs.Root defaultValue="employee">
      <Tabs.List>
        <Tabs.Trigger value="employee">{t('employee')}</Tabs.Trigger>
        <Tabs.Trigger value="assets">{t('asset.type.assets')}</Tabs.Trigger>
        <Tabs.Trigger value="weapons">{t('asset.type.weapons')}</Tabs.Trigger>
        <Tabs.Trigger value="equipments">{t('asset.type.equipments')}</Tabs.Trigger>
        <Tabs.Trigger value="checkout_payment">Checkout Payment</Tabs.Trigger>
      </Tabs.List>

      <Box px="4" pt="3" pb="2">
        <Tabs.Content value="employee">
          <Text size="2">Let's choose the one who will help you in your journey</Text>
        </Tabs.Content>
        {Object.entries(assets as AssetsReduce).map(([assetKey, value]) => (
          <Tabs.Content value={assetKey} key={`asset-${assetKey}-tabs`}>
            <Text size="2">{t(`asset.type.${assetKey}`)}</Text>
            {Object.keys(value).map((key) => (
              <>
                <Grid className="mt-2" columns="1fr auto auto auto" gap="3" align="center">
                  <AssetCard
                    key={`${key}`}
                    asset={value[key]}
                    quantity={
                      (crewMemberAssets as CrewMemberAssetsReduce) &&
                      crewMemberAssets[assetKey][key]?.quantity
                    }
                  />
                  <Button onClick={() => addAsset({ id: key, quantity: 0 })}>+</Button>
                  <Button onClick={() => removeAsset({ id: key, quantity: 0 })}>-</Button>
                  {crewMemberAssetItems && crewMemberAssetItems[key]?.quantity > 0 && (
                    <Button color="red">$</Button>
                  )}
                </Grid>
              </>
            ))}
          </Tabs.Content>
        ))}
        {/* <Tabs.Content value="assets">
          <Text size="2">{t('asset.type.assets.catch_phrase')}</Text>
          {Object.keys(assetItems).map((key) => (
            <>
              <Grid className="mt-2" columns="1fr auto auto auto" gap="3" align="center">
                <AssetCard
                  key={`asset-${key}`}
                  asset={assetItems[key]}
                  quantity={crewMemberAssetItems && crewMemberAssetItems[key]?.quantity}
                />
                <Button>+</Button>
                <Button>-</Button>
                {crewMemberAssetItems && crewMemberAssetItems[key]?.quantity > 0 && (
                  <Button color="red">$</Button>
                )}
              </Grid>
            </>
          ))}
        </Tabs.Content>

        <Tabs.Content value="weapons">
          <Text size="2">{t('asset.type.weapons.catch_phrase')}</Text>
          {Object.keys(weapons).map((key) => (
            <>
              <Grid className="mt-2" columns="1fr auto auto auto" gap="3" align="center">
                <AssetCard
                  key={`weapon-${key}`}
                  asset={weapons[key]}
                  quantity={crewMemberWeapons && crewMemberWeapons[key]?.quantity}
                />
                <Button>+</Button>
                <Button>-</Button>
                {crewMemberWeapons && crewMemberWeapons[key]?.quantity > 0 && (
                  <Button color="red">$</Button>
                )}
              </Grid>
            </>
          ))}
        </Tabs.Content>

        <Tabs.Content value="equipments">
          <Text size="2">{t('asset.type.equipments.catch_phrase')}</Text>
          {Object.keys(equipments).map((key) => (
            <>
              <Grid className="mt-2" columns="1fr auto auto auto" gap="3" align="center">
                <AssetCard
                  key={`equipment-${key}`}
                  asset={equipments[key]}
                  quantity={crewMemberEquipments && crewMemberEquipments[key]?.quantity}
                />
                <Button>+</Button>
                <Button>-</Button>
                {crewMemberEquipments && crewMemberEquipments[key]?.quantity > 0 && (
                  <Button color="red">$</Button>
                )}
              </Grid>
            </>
          ))} */}
        {/* </Tabs.Content> */}
        <Tabs.Content value="checkout_payment">
          <Text size="2">Checkout Payment</Text>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
