import * as Dialog from '@radix-ui/react-dialog';
import { Box, Button, Card, Flex, Grid, Heading, Section, Tabs, Text } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { useTypedLoaderData } from 'remix-typedjson';

import { getAssets, getAssetsForbiddenForHeist } from '~/lib/api/asset';
import { getCrewMemberByUserAndHeist } from '~/lib/api/crew-member';
import { getHeistPartial } from '~/lib/api/heist';
import { AssetTypeEnum } from '~/lib/api/types';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { i18next } from '~/lib/i18n/index.server';
import { hasPathError } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { prepareHeistResolver } from '~/lib/validators/prepareHeist';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Asset, CrewMember, HeistAsset, HeistAssetCursorConnection } from '~/lib/api/types';
import type { PrepareHeistFormData } from '~/lib/validators/prepareHeist';

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
    const {
      heist: { employee, allowedEmployees },
    } = await getHeistPartial(
      context.client,
      params.heistId,
      `
      allowedEmployees {
        edges {
          node {
            id
            user {
              id
              username
            }
          }
        }
      }
      employee {
        id
        user {
          username
        }
      }
    `,
    );

    // Get the crew member for the current user and the current heist
    let crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    if (!crewMember) {
      throw redirect(`/map/${params.placeId}`);
    }

    // Get all the assets
    const { assets } = await getAssets(context.client);

    // Get the assets forbidden for the current heist
    const { assets: assetsForbidden } = await getAssetsForbiddenForHeist(
      context.client,
      params.heistId,
    );

    // Get the current assets for the crew member
    const assetsCrewMember = crewMember.heistAssets.edges;

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

    // Remove the heistAssets from the crewMember object, they are already in the assetsPurchased
    const {
      heistAssets: _,
      ...rest
    }: { heistAssets: HeistAssetCursorConnection } & Omit<CrewMember, 'heistAssets'> = crewMember;

    return {
      employee,
      allowedEmployees,
      crewMember: rest,
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

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { errors, data } = await getValidatedFormData<PrepareHeistFormData>(
    request,
    prepareHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }
  if (typeof data.assetsPurchased === 'string') {
    console.log(JSON.parse(data.assetsPurchased), data.employee);
  }

  return {};
}

const CardAsset = ({ asset, quantity }: { asset: Asset; quantity: number }) => (
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

const TabsAsset = ({
  text,
  value,
  assets,
  setQuantity,
  onAddAsset,
  onRemoveAsset,
}: {
  text: string;
  value: string;
  assets: AssetCategory<Asset>;
  setQuantity: (assetId: string) => number;
  onAddAsset: (assetId: string) => void;
  onRemoveAsset: (assetId: string) => void;
}) => (
  <Tabs.Content value={value}>
    <Text size="2">{text}</Text>
    <>
      {Object.keys(assets).map((type, index) => (
        <Grid
          key={`${value}-${assets[type].id}-${index}`}
          className="mt-2"
          columns="1fr auto auto auto"
          gap="3"
          align="center"
        >
          <CardAsset asset={assets[type]} quantity={setQuantity(assets[type].id)} />
          <Button onClick={() => onAddAsset(assets[type].id)}>+</Button>
          <Button onClick={() => onRemoveAsset(assets[type].id)}>-</Button>
        </Grid>
      ))}
    </>
  </Tabs.Content>
);

export default function Prepare() {
  const { t } = useTranslation();
  const { assets, assetsPurchased, assetsCrewMember, crewMember, employee, allowedEmployees } =
    useTypedLoaderData<Loader>();

  const [cartAssets, setCartAssets] = useState<{
    [key: string]: AssetPurchased;
  }>(assetsPurchased);

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
          if (prev[id].crewMemberAssetId) {
            return {
              ...prev,
              [id]: { ...prev[id], quantity: 0 },
            };
          } else {
            const { [id]: _, ...rest } = prev;
            return { ...rest };
          }
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

  const allowedEmployeesFormatted = allowedEmployees.edges.map((edge) => ({
    value: edge.node.id,
    label: edge.node.user.username,
  }));

  const methods = useRemixForm<PrepareHeistFormData>({
    mode: 'onSubmit',
    resolver: prepareHeistResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    submitHandlers: {
      onInvalid: async (error) => {
        console.log(error);
      },
    },
  });

  useEffect(() => {
    methods.setValue('assetsPurchased', JSON.stringify({ cartAssets, crewMember }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartAssets]);

  return (
    <>
      <RemixFormProvider {...methods}>
        <form id={`assets-form`} method="post" onSubmit={methods.handleSubmit}>
          <FieldInput type="hidden" name="assetsPurchased" label="assetsPurchased" hideLabel />
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
                <Text size="2">
                  {employee
                    ? `${employee.user.username} will help you in your journey.`
                    : `Let's choose the one who will help you in your journey`}
                </Text>
                {!employee && (
                  <FieldSelect
                    name="employee"
                    label={t('employee')}
                    options={allowedEmployeesFormatted}
                  />
                )}
              </Tabs.Content>

              <TabsAsset
                value="assets"
                text={t('asset.type.assets.catch_phrase')}
                assets={assets[AssetTypeEnum.Asset]}
                setQuantity={(assetId) => getQuantity(assetId)}
                onAddAsset={(assetId) =>
                  addAsset({
                    id: assetId,
                    quantity: getQuantity(assetId),
                    crewMemberAssetId: assetsCrewMember[assetId]?.id,
                  })
                }
                onRemoveAsset={(assetId) => removeAsset({ id: assetId })}
              />

              <TabsAsset
                value="weapons"
                text={t('asset.type.weapons.catch_phrase')}
                assets={assets[AssetTypeEnum.Weapon]}
                setQuantity={(assetId) => getQuantity(assetId)}
                onAddAsset={(assetId) => addAsset({ id: assetId, quantity: getQuantity(assetId) })}
                onRemoveAsset={(assetId) => removeAsset({ id: assetId })}
              />

              <TabsAsset
                value="equipments"
                text={t('asset.type.equipments.catch_phrase')}
                assets={assets[AssetTypeEnum.Equipment]}
                setQuantity={(assetId) => getQuantity(assetId)}
                onAddAsset={(assetId) => addAsset({ id: assetId, quantity: getQuantity(assetId) })}
                onRemoveAsset={(assetId) => removeAsset({ id: assetId })}
              />

              <Tabs.Content value="checkout_payment">
                <Dialog.Title asChild>
                  <Heading as="h2" size="8">
                    Checkout Payment
                  </Heading>
                </Dialog.Title>
                <Section className="space-y-3" size="1">
                  <SubmitButton text="Purchase" />
                </Section>
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </form>
      </RemixFormProvider>
    </>
  );
}
