import * as Dialog from '@radix-ui/react-dialog';
import { Box, Button, Card, Flex, Grid, Heading, Section, Tabs, Text } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { useTypedLoaderData } from 'remix-typedjson';

import { getAssets, getAssetsForbiddenForHeist } from '~/lib/api/asset';
import {
  getCrewMemberByUserAndHeist,
  getCrewMemberByUserAndHeistPartial,
} from '~/lib/api/crew-member';
import { chooseEmployeeHeist, getHeistPartial } from '~/lib/api/heist';
import { bulkCreateHeistAsset } from '~/lib/api/heist-asset';
import { AssetTypeEnum } from '~/lib/api/types';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import { prepareHeistResolver } from '~/lib/validators/prepare-heist';
import { FLASH_MESSAGE_KEY } from '~/root';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Asset, HeistAsset } from '~/lib/api/types';
import type { PrepareHeistFormData } from '~/lib/validators/prepare-heist';
import type { FlashMessage } from '~/root';

type AssetCategory<T> = Record<string, T>;
type AssetsOrganized = Record<string, AssetCategory<Asset>>;
type HeistAssetsOrganized = Record<string, HeistAsset>;

type AssetPurchased = {
  id: string;
  newQuantity?: number;
  heistAsset?: {
    id: string;
    quantity: number;
  };
};

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
    const heistAssets = crewMember.heistAssets.edges;

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
    const assetsPurchased = heistAssets.reduce<{ [key: string]: AssetPurchased }>((acc, curr) => {
      acc[curr.node.asset.id] = {
        id: curr.node.asset.id,
        heistAsset: {
          id: curr.node.id,
          quantity: curr.node.quantity,
        },
      };
      return acc;
    }, {});

    return {
      employee,
      allowedEmployees,
      assetsPurchased,
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
  const user = denyAccessUnlessGranted(context.user, [ROLES.ADMIN, ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<PrepareHeistFormData>(
    request,
    prepareHeistResolver,
  );

  if (errors) {
    return json({ errors }, { status: 400 });
  }

  let errorMessage: string | null = null;
  const session = await getSession(request.headers.get('Cookie'));

  try {
    let crewMember = await getCrewMemberByUserAndHeistPartial(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    if (!crewMember) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('crewmember.not_found', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}`, {
        headers: { 'Set-Cookie': await commitSession(session) },
      });
    }

    const {
      heist: { employee },
    } = await getHeistPartial(
      context.client,
      params.heistId,
      `
      employee {
        id
      }
    `,
    );

    if (!employee && !data.employee) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('asset.prepare.need_employee', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return json(
        { errors: {} },
        { status: 400, headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }

    const assetsPurchasedParsed = JSON.parse(data.assetsPurchased as string) as AssetPurchased[];

    if (!employee && data.employee) {
      await chooseEmployeeHeist(context.client, {
        id: params.heistId,
        employeeId: data.employee,
      });
    }

    const newAssetsPurchased = assetsPurchasedParsed.reduce<{ id: string; quantity: number }[]>(
      (acc, curr) => {
        if (!curr.heistAsset && curr.newQuantity) {
          acc.push({
            id: curr.id,
            quantity: curr.newQuantity,
          });
        }

        return acc;
      },
      [],
    );

    if (newAssetsPurchased.length > 0) {
      await bulkCreateHeistAsset(context.client, {
        assets: newAssetsPurchased,
        crewMemberId: crewMember.id,
      });

      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare_successfully', { ns: 'flash' }),
        type: 'success',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    }
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 400, 404, 403])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 400, 404, 403]);
    } else {
      throw error;
    }

    if (errorMessage) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: errorMessage,
        type: 'error',
      } as FlashMessage);
    }

    return json(
      { errors: {} },
      { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

const CardAsset = ({ asset, quantity }: { asset: Asset; quantity: number }) => (
  <Card
    className={`${quantity > 0 ? (quantity === asset.maxQuantity ? '!border-green-6 !bg-green-3' : '!border-blue-6 !bg-blue-3') : ''}`}
  >
    <Box>
      <Flex gap="3" justify="between">
        <Text as="div" size="2" weight="bold">
          {asset.name}
        </Text>
        <Text as="div" size="2" color="gray">
          {quantity}/{asset.maxQuantity}
        </Text>
      </Flex>
    </Box>
  </Card>
);

const TabsAsset = ({
  text,
  value,
  assets,
  showQuantity,
  onQuantity,
  onAddAsset,
  onRemoveAsset,
}: {
  text: string;
  value: string;
  assets: AssetCategory<Asset>;
  onQuantity: (assetId: string) => number;
  showQuantity: (assetId: string) => number;
  onAddAsset: (asset: Asset) => void;
  onRemoveAsset: (asset: Asset) => void;
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
          <CardAsset asset={assets[type]} quantity={showQuantity(assets[type].id)} />
          <Button type="button" onClick={() => onAddAsset(assets[type])}>
            +
          </Button>
          {onQuantity(assets[type].id) > 0 && (
            <Button type="button" onClick={() => onRemoveAsset(assets[type])}>
              -
            </Button>
          )}
        </Grid>
      ))}
    </>
  </Tabs.Content>
);

export default function Prepare() {
  const { t } = useTranslation();
  const { assets, assetsPurchased, employee, allowedEmployees } = useTypedLoaderData<Loader>();

  const [cartAssets, setCartAssets] = useState<{
    [key: string]: AssetPurchased;
  }>(assetsPurchased);

  const [totalPrice, setTotalPrice] = useState<number>(0);

  const addAsset = (asset: Asset) => {
    setCartAssets((prev) => {
      const cartAsset = prev[asset.id];

      if (cartAsset) {
        if (cartAsset.newQuantity) {
          if (cartAsset.heistAsset) {
            if (cartAsset.newQuantity + cartAsset.heistAsset.quantity + 1 <= asset.maxQuantity) {
              setTotalPrice((prev) => prev + asset.price);
              return {
                ...prev,
                [cartAsset.id]: {
                  ...cartAsset,
                  newQuantity: cartAsset.newQuantity + 1,
                },
              };
            }

            return { ...prev };
          } else {
            if (cartAsset.newQuantity + 1 <= asset.maxQuantity) {
              setTotalPrice((prev) => prev + asset.price);
              return {
                ...prev,
                [cartAsset.id]: {
                  ...cartAsset,
                  newQuantity: cartAsset.newQuantity + 1,
                },
              };
            }

            return { ...prev };
          }
        }

        setTotalPrice((prev) => prev + asset.price);
        return {
          ...prev,
          [cartAsset.id]: {
            ...cartAsset,
            newQuantity: 1,
          },
        };
      }

      setTotalPrice((prev) => prev + asset.price);
      return {
        ...prev,
        [asset.id]: {
          id: asset.id,
          newQuantity: 1,
        },
      };
    });
  };

  const removeAsset = async (asset: Asset) => {
    setCartAssets((prev) => {
      const cartAsset = prev[asset.id];

      if (cartAsset) {
        if (cartAsset.newQuantity) {
          if (cartAsset.newQuantity - 1 > 0) {
            setTotalPrice((prev) => prev - asset.price);
            return {
              ...prev,
              [cartAsset.id]: {
                ...cartAsset,
                newQuantity: cartAsset.newQuantity - 1,
              },
            };
          }

          setTotalPrice((prev) => prev - asset.price);

          const { [cartAsset.id]: _, ...rest } = prev;

          return { ...rest };
        }
        return { ...prev };
      }

      return { ...prev };
    });
  };

  // Get the quantity of an asset in the cart
  const getQuantity = (id: string) => {
    const cartAsset = cartAssets[id];
    if (cartAsset && cartAsset?.newQuantity) {
      return cartAsset.newQuantity;
    }

    return 0;
  };

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
    defaultValues: {
      employee: allowedEmployeesFormatted[0].value,
    },
  });

  useEffect(() => {
    methods.setValue('assetsPurchased', JSON.stringify(Object.values(cartAssets)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartAssets]);

  let employeeChosen =
    employee && allowedEmployees.edges.find((edge) => edge.node.id === employee.id);
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
              <Tabs.Trigger value="checkout_payment">{t('checkout_payment.title')}</Tabs.Trigger>
            </Tabs.List>

            <Box px="4" pt="3" pb="2">
              <Tabs.Content value="employee">
                <Text size="2" className="mb-2">
                  {employeeChosen
                    ? `${employeeChosen.node.user.username} will help you in your journey.`
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

              {Object.entries({
                assets: AssetTypeEnum.Asset,
                weapons: AssetTypeEnum.Weapon,
                equipments: AssetTypeEnum.Equipment,
              }).map(([key, value]) => (
                <TabsAsset
                  key={key}
                  value={key}
                  text={t(`asset.type.${key}.catch_phrase`)}
                  assets={assets[value]}
                  showQuantity={(assetId) =>
                    getQuantity(assetId) +
                    (cartAssets[assetId] ? cartAssets[assetId].heistAsset?.quantity ?? 0 : 0)
                  }
                  onQuantity={(assetId) => getQuantity(assetId)}
                  onAddAsset={(asset) => addAsset(asset)}
                  onRemoveAsset={(asset) => removeAsset(asset)}
                />
              ))}

              <Tabs.Content value="checkout_payment">
                <Dialog.Title asChild>
                  <Heading as="h2" size="8">
                    {t('checkout_payment.title')}
                  </Heading>
                </Dialog.Title>
                <Section className="space-y-3" size="1">
                  <Text size="2" className="mb-2">
                    {t('checkout_payment.description', { totalPrice })}
                  </Text>
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
