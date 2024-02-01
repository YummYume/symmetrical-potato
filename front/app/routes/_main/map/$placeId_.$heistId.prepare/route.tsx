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
import type { Asset, HeistAsset } from '~/lib/api/types';

type AssetCategory<T> = Record<string, T>;
type AssetsOrganized = Record<string, AssetCategory<Asset>>;
type AssetsCrewMemberOrganized = Record<string, HeistAsset>;

type AssetPurchased = { id: string; quantity: number; crewMemberAssetId?: string };

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');

  try {
    // Get the crew member for the current user and the current heist
    const crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    // Get all the assets
    const { assets } = await getAssets(context.client);

    // Get the assets forbidden for the current heist
    const { assets: assetsForbidden } = await getAssetsForbiddenForHeist(
      context.client,
      params.heistId,
    );

    // Get the current assets for the crew member
    const assetsCrewMember = crewMember ? crewMember.heistAssets.edges : [];

    const assetsCrewMemberOrganized = assetsCrewMember.reduce<AssetsCrewMemberOrganized>(
      (acc, curr) => {
        acc[curr.node.asset.id] = curr.node;
        return acc;
      },
      {},
    );

    // Organize the assets by type
    const assetsOrganized = assets.edges.reduce<AssetsOrganized>(
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
    );

    // Format the assets already purchased by the crew member
    const assetsPurchased = assetsCrewMember.reduce<{ [key: string]: AssetPurchased }>(
      (acc, curr) => {
        acc[curr.node.asset.id] = curr.node;
        return acc;
      },
      {},
    );

    return {
      assetsPurchased,
      assetsCrewMember: assetsCrewMemberOrganized,
      assets: assetsOrganized,
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

const AssetCard = ({ asset, quantity }: { asset: Asset; quantity: number }) => (
  <Card className={`${quantity > 0 ? '!border-green-6 !bg-green-3' : ''}`}>
    <Box>
      <Flex gap="3" justify="between">
        <Text as="div" size="2" weight="bold">
          {asset.name}
        </Text>
        <Text as="div" size="2" color="gray">
          {quantity}/5
        </Text>
      </Flex>
    </Box>
  </Card>
);

// const TabRow = ({
//   asset,
//   crewMemberAsset,
//   quantity,
//   onAddAsset,
//   onRemoveAsset,
// }: {
//   asset: Asset;
//   crewMemberAsset: CrewMemberAsset;
//   quantity: number;
//   onAddAsset: (props: AssetProps) => void;
//   onRemoveAsset: (props: { id: string }) => void;
// }) => (
//   <>
//     <AssetCard asset={asset} quantity={quantity} />
//     <Button
//       onClick={() =>
//         onAddAsset({
//           id: asset.id,
//           quantity: crewMemberAsset.quantity,
//           crewMemberAssetId: crewMemberAsset.id,
//         })
//       }
//     >
//       +
//     </Button>
//     {crewMemberAsset.quantity > 0 && (
//       <Button
//         onClick={() =>
//           onRemoveAsset({
//             id: asset.id,
//           })
//         }
//       >
//         -
//       </Button>
//     )}
//   </>
// );

// const TabsAsset = ({
//   text,
//   value,
//   assets,
//   cartAsset,
//   crewMemberAssets,
//   onAddAsset,
//   onRemoveAsset,
// }: {
//   text: string;
//   value: string;
//   cartAsset: { [key: string]: AssetProps };
//   assets: AssetCategory<Asset>;
//   crewMemberAssets: AssetCategory<HeistAsset>;

//   onAddAsset: (props: AssetProps) => void;
//   onRemoveAsset: (props: AssetProps) => void;
// }) => (
//   <Tabs.Content value={value}>
//     <Text size="2">{text}</Text>
//     {Object.keys(assets).map((key) => (
//       <>
//         <Grid
//           key={`${value}-${key}`}
//           className="mt-2"
//           columns="1fr auto auto auto"
//           gap="3"
//           align="center"
//         >
//           <AssetCard
//             asset={assets[key]}
//             quantity={
//               (cartAsset[assets[key].id] && cartAsset[assets[key].id].quantity) ??
//               (crewMemberAssets && crewMemberAssets[key]?.quantity)
//             }
//           />
//           <Button
//             onClick={() =>
//               onAddAsset({
//                 id: assets[key].id,
//                 quantity: crewMemberAssets && crewMemberAssets[key]?.quantity,
//                 crewMemberAssetId: crewMemberAssets[key]?.id,
//               })
//             }
//           >
//             +
//           </Button>
//           {crewMemberAssets && crewMemberAssets[key]?.quantity > 0 && (
//             <Button
//               onClick={() =>
//                 onRemoveAsset({
//                   id: assets[key].id,
//                   quantity: crewMemberAssets && crewMemberAssets[key]?.quantity,
//                   crewMemberAssetId: crewMemberAssets[key]?.id,
//                 })
//               }
//             >
//               -
//             </Button>
//           )}
//         </Grid>
//       </>
//     ))}
//   </Tabs.Content>
// );

export default function Prepare() {
  const { t } = useTranslation();
  const { assets, assetsPurchased, assetsCrewMember } = useTypedLoaderData<Loader>();

  const [cartAssets, setCartAssets] = useState<{
    [key: string]: AssetPurchased;
  }>(assetsPurchased);

  useEffect(() => {
    console.log(cartAssets);
  }, [cartAssets]);

  const addAsset = ({ id, quantity, crewMemberAssetId }: AssetPurchased) => {
    setCartAssets((prev) => {
      if (prev[id]) {
        if (prev[id].quantity + 1 > 5) {
          return { ...prev };
        } else {
          return {
            ...prev,
            [id]: { ...prev[id], quantity: prev[id].quantity + 1 },
          };
        }
      } else {
        return {
          ...prev,
          [id]: { id, quantity: (quantity ?? 0) + 1, crewMemberAssetId },
        };
      }
    });
  };

  const removeAsset = ({ id }: { id: string }) => {
    setCartAssets((prev) => {
      if (prev[id]) {
        if (prev[id].quantity - 1 <= 0) {
          const { [id]: _, ...rest } = prev;
          return { ...rest };
        } else {
          return {
            ...prev,
            [id]: { ...prev[id], quantity: prev[id].quantity - 1 },
          };
        }
      } else {
        return { ...prev };
      }
    });
  };

  // Get the quantity of an asset in the cart
  const getQuantity = (id: string) => (cartAssets[id] ? cartAssets[id].quantity : 0);

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

        <Tabs.Content value="assets">
          <Text size="2">{t('asset.type.assets.catch_phrase')}</Text>
          {Object.keys(assets[AssetTypeEnum.Asset]).map((key) => (
            <>
              <Grid
                key={`assets-${AssetTypeEnum.Asset}-${key}`}
                className="mt-2"
                columns="1fr auto auto auto"
                gap="3"
                align="center"
              >
                <AssetCard
                  key={`assets-${AssetTypeEnum.Asset}-${key}-card`}
                  asset={assets[AssetTypeEnum.Asset][key]}
                  quantity={getQuantity(assets[AssetTypeEnum.Asset][key].id)}
                />
                <Button
                  onClick={() =>
                    addAsset({
                      id: assets[AssetTypeEnum.Asset][key].id,
                      quantity: getQuantity(assets[AssetTypeEnum.Asset][key].id),
                      crewMemberAssetId:
                        assetsCrewMember[assets[AssetTypeEnum.Asset][key].id] &&
                        assetsCrewMember[assets[AssetTypeEnum.Asset][key].id].id,
                    })
                  }
                >
                  +
                </Button>
                <Button
                  onClick={() =>
                    removeAsset({
                      id: assets[AssetTypeEnum.Asset][key].id,
                    })
                  }
                >
                  -
                </Button>
              </Grid>
            </>
          ))}
        </Tabs.Content>

        {/* <TabsAsset
          value="assets"
          text={t('asset.type.assets.catch_phrase')}
          cartAsset={cartAsset}
          assets={assets[AssetTypeEnum.Asset]}
          crewMemberAssets={crewMemberAssets ? crewMemberAssets[AssetTypeEnum.Asset] : {}}
          onAddAsset={addAsset}
          onRemoveAsset={removeAsset}
        />

        <TabsAsset
          value="weapons"
          text={t('asset.type.weapons.catch_phrase')}
          cartAsset={cartAsset}
          assets={assets[AssetTypeEnum.Weapon]}
          crewMemberAssets={crewMemberAssets ? crewMemberAssets[AssetTypeEnum.Weapon] : {}}
          onAddAsset={addAsset}
          onRemoveAsset={removeAsset}
        />

        <TabsAsset
          value="equipments"
          text={t('asset.type.equipments.catch_phrase')}
          cartAsset={cartAsset}
          assets={assets[AssetTypeEnum.Equipment]}
          crewMemberAssets={crewMemberAssets ? crewMemberAssets[AssetTypeEnum.Equipment] : {}}
          onAddAsset={addAsset}
          onRemoveAsset={removeAsset}
        /> */}

        <Tabs.Content value="checkout_payment">
          <Text size="2">Checkout Payment</Text>
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
