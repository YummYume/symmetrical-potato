import * as Dialog from '@radix-ui/react-dialog';
import {
  PlusCircledIcon,
  MinusCircledIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@radix-ui/react-icons';
import { Box, Button, Callout, Flex, Grid, Heading, Section, Tabs, Text } from '@radix-ui/themes';
import { json, redirect } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';
import { useTypedLoaderData } from 'remix-typedjson';
import { toast } from 'sonner';
import { z } from 'zod';

import { getAssets, getAssetsForbiddenForHeist } from '~/lib/api/asset';
import {
  getCrewMemberByUserAndHeist,
  getCrewMemberByUserAndHeistPartial,
} from '~/lib/api/crew-member';
import { getHeistPartial } from '~/lib/api/heist';
import { bulkCreateHeistAssets, bulkUpdateHeistAssets } from '~/lib/api/heist-asset';
import { AssetTypeEnum } from '~/lib/api/types';
import { Link } from '~/lib/components/Link';
import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~/lib/utils/api';
import { ROLES } from '~/lib/utils/roles';
import { denyAccessUnlessGranted } from '~/lib/utils/security.server';
import {
  assetsPurchasedResolver,
  type AssetsPurchasedFormData,
  chooseEmployeeResolver,
} from '~/lib/validators/prepare-heist';
import { FLASH_MESSAGE_KEY } from '~/root';

import { PaymentDisplay } from './PaymentDisplay';
import { TabsAsset } from './TabsAsset';

import type { ActionFunctionArgs } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Asset } from '~/lib/api/types';
import type { ChooseEmployeeFormData } from '~/lib/validators/prepare-heist';
import type { FlashMessage } from '~/root';

type AssetCategory<T> = Record<string, T>;
type AssetsOrganized = Record<string, AssetCategory<Asset>>;
type AssetsOrganizedByName = Record<string, Asset>;

const assetPurchasedSchema = z.object({
  id: z.string(),
  newQuantity: z.number().int().positive().optional(),
  heistAsset: z
    .object({
      id: z.string(),
      quantity: z.number().int().positive(),
    })
    .optional(),
});

type AssetPurchased = z.infer<typeof assetPurchasedSchema>;

const assetsPurchasedSchema = z.array(assetPurchasedSchema);

type NewHeistAssetPayload = { id: string; quantity: number };
type UpdateHeistAssetPayload = { id: string; quantity: number };

type Payloads = {
  newHeistAssets: NewHeistAssetPayload[];
  updateHeistAssets: UpdateHeistAssetPayload[];
};

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, 'response');
  const session = await getSession(request.headers.get('Cookie'));

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

    if (allowedEmployees.totalCount <= 0) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.no_employee_available', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      throw redirect(`/map/${params.placeId}/heist/${params.heistId}`, {
        headers: { 'Set-Cookie': await commitSession(session) },
      });
    }

    // Get the crew member for the current user and the current heist
    let crewMember = await getCrewMemberByUserAndHeist(context.client, {
      heistId: params.heistId,
      userId: user.id,
    });

    if (!crewMember) {
      throw redirect(`/map/${params.placeId}/heist/${params.heistId}`);
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
        if (
          !assetsForbidden.edges.some((edge) => edge.node.id === curr.node.id) &&
          (curr.node.heist === null || curr.node.heist.id === `/heists/${params.heistId}`)
        ) {
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

    // Organize the assets by id
    const assetsOrganizedById = assets.edges.reduce<AssetsOrganizedByName>((acc, curr) => {
      if (!assetsForbidden.edges.some((edge) => edge.node.id === curr.node.id)) {
        acc[curr.node.id] = curr.node;
      }

      return acc;
    }, {});

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
      heistId: params.heistId,
      placeId: params.placeId,
      employee,
      allowedEmployees,
      assetsPurchased,
      assetsOrganizedById,
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
  const user = denyAccessUnlessGranted(context.user, [ROLES.HEISTER]);

  if (!params.heistId) {
    throw redirect(`/map/${params.placeId}`);
  }

  const t = await i18next.getFixedT(request, ['validators', 'flash']);
  const { errors, data } = await getValidatedFormData<AssetsPurchasedFormData>(
    request,
    assetsPurchasedResolver,
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
        content: t('heist.prepare.not_in_crew', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}/heist/${params.heistId}`, {
        headers: { 'Set-Cookie': await commitSession(session) },
      });
    }

    // Parse the assets purchased
    const assetsPurchasedParsed = JSON.parse(data.assetsPurchased as string) as AssetPurchased[];

    if (!assetsPurchasedSchema.safeParse(assetsPurchasedParsed).success) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.assets.invalid', { ns: 'flash' }),
        type: 'error',
      } as FlashMessage);

      return json(
        { errors: {} },
        { status: 400, headers: { 'Set-Cookie': await commitSession(session) } },
      );
    }

    const { newHeistAssets, updateHeistAssets } = assetsPurchasedParsed.reduce<Payloads>(
      (acc, curr) => {
        if (!curr.heistAsset && curr.newQuantity) {
          acc.newHeistAssets.push({
            id: curr.id,
            quantity: curr.newQuantity,
          });
        }

        if (curr.heistAsset && curr.newQuantity) {
          acc.updateHeistAssets.push({
            id: curr.heistAsset.id,
            quantity: curr.heistAsset.quantity + curr.newQuantity,
          });
        }

        return acc;
      },
      { newHeistAssets: [], updateHeistAssets: [] },
    );

    if (newHeistAssets.length > 0) {
      await bulkCreateHeistAssets(context.client, {
        assets: newHeistAssets,
        crewMemberId: crewMember.id,
      });
    }

    if (updateHeistAssets.length > 0) {
      await bulkUpdateHeistAssets(context.client, {
        heistAssets: updateHeistAssets,
      });
    }

    if (newHeistAssets.length > 0 || updateHeistAssets.length > 0) {
      session.flash(FLASH_MESSAGE_KEY, {
        content: t('heist.prepare.assets.purchased_successfully', { ns: 'flash' }),
        type: 'success',
      } as FlashMessage);

      return redirect(`/map/${params.placeId}/heist/${params.heistId}`, {
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

export default function Prepare() {
  const { t } = useTranslation();
  const {
    user,
    assets,
    assetsPurchased,
    employee,
    allowedEmployees,
    assetsOrganizedById,
    placeId,
    heistId,
  } = useTypedLoaderData<Loader>();

  const [cart, setCart] = useState<{
    [key: string]: AssetPurchased;
  }>(assetsPurchased);

  const [totalPrice, setTotalPrice] = useState<number>(0);

  const allowedEmployeesFormatted = allowedEmployees.edges.map((edge) => ({
    value: edge.node.id,
    label: edge.node.user.username,
  }));

  const addAsset = (asset: Asset) => {
    setCart((prev) => {
      const cartAsset = prev[asset.id];

      // If the asset is not in the cart, we add it
      if (!cartAsset) {
        setTotalPrice((prev) => prev + asset.price);
        return {
          ...prev,
          [asset.id]: {
            id: asset.id,
            newQuantity: 1,
          },
        };
      }

      // If the asset is already in the cart and already purchased
      if (cartAsset.heistAsset && cartAsset.newQuantity) {
        // If the new quantity + the quantity already purchased is less than the max quantity
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
      }

      // If the asset is already purchased
      if (cartAsset.heistAsset) {
        // If the quantity already purchased + 1 is less than the max quantity
        if (cartAsset.heistAsset.quantity + 1 <= asset.maxQuantity) {
          setTotalPrice((prev) => prev + asset.price);
          return {
            ...prev,
            [cartAsset.id]: {
              ...cartAsset,
              newQuantity: 1,
            },
          };
        }
      }

      // If the asset is already in the cart
      if (cartAsset.newQuantity) {
        // If the new quantity + 1 is less than the max quantity, we add 1 to the new quantity
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
      }

      return { ...prev };
    });
  };

  const removeAsset = async (asset: Asset) => {
    setCart((prev) => {
      const cartAsset = prev[asset.id];

      if (!cartAsset || !cartAsset.newQuantity) {
        return { ...prev };
      }

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

      if (cartAsset.heistAsset) {
        const { newQuantity, ...rest } = cartAsset;
        return { ...prev, [cartAsset.id]: rest };
      }

      const { [cartAsset.id]: _, ...rest } = prev;

      return { ...rest };
    });
  };

  const clearCart = () => {
    setCart({ ...assetsPurchased });
    setTotalPrice(0);
  };

  // Get the quantity of an asset in the cart
  const getQuantity = (id: string) => {
    const cartAsset = cart[id];
    if (cartAsset && cartAsset?.newQuantity) {
      return cartAsset.newQuantity;
    }

    return 0;
  };

  const methodsEmployee = useRemixForm<ChooseEmployeeFormData>({
    mode: 'onSubmit',
    resolver: chooseEmployeeResolver,
    submitConfig: {
      action: `/map/${placeId}/${heistId}/choose_employee`,
      unstable_viewTransition: true,
    },
    defaultValues: {
      employee: allowedEmployeesFormatted && allowedEmployeesFormatted[0].value,
    },
  });

  const methodsAssetPurchased = useRemixForm<AssetsPurchasedFormData>({
    mode: 'onSubmit',
    resolver: assetsPurchasedResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    submitHandlers: {
      onInvalid: async (errors) => {
        //@ts-ignore
        const { assetsPurchased } = errors;
        if (assetsPurchased?.message) {
          toast.error(assetsPurchased.message, {
            position: 'bottom-right',
            duration: 10000,
            dismissible: true,
          });
        }
      },
    },
  });

  useEffect(() => {
    methodsAssetPurchased.setValue('assetsPurchased', JSON.stringify(Object.values(cart)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  let employeeChosen =
    employee && allowedEmployees.edges.find((edge) => edge.node.id === employee.id);

  const asssetsPurchasedFormatted = Object.values(cart).reduce<
    { quantity: number; name: string; price: number }[]
  >((acc, curr) => {
    if (curr.newQuantity) {
      const asset = assetsOrganizedById[curr.id];
      acc.push({
        name: asset.name,
        price: asset.price,
        quantity: curr.newQuantity,
      });
    }

    return acc;
  }, []);
  return (
    <>
      <RemixFormProvider {...methodsAssetPurchased}>
        <form
          id="heist-prepare-assets-form"
          className="hidden"
          method="post"
          onSubmit={methodsAssetPurchased.handleSubmit}
        >
          <FieldInput
            type="hidden"
            name="assetsPurchased"
            label="assetsPurchased"
            hideLabel
            hideError
          />
        </form>
      </RemixFormProvider>

      <Link className="flex items-center gap-1 pb-1 pl-2" to={`/map/${placeId}/heist/${heistId}`}>
        <span aria-hidden="true">
          <ArrowLeftIcon width="20" height="20" />
        </span>
        {t('back')}
      </Link>

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
            <Text size="3" className="italic">
              {employeeChosen
                ? t('heist.employee.chosen', { name: employeeChosen.node.user.username })
                : t('heist.employee.not_chosen')}
            </Text>
            {!employee && (
              <RemixFormProvider {...methodsEmployee}>
                <form
                  id="heist-prepare-employee-form"
                  className="mt-2"
                  method="post"
                  onSubmit={methodsEmployee.handleSubmit}
                >
                  <Grid columns="1fr auto" gap="3" align="center">
                    <FieldSelect
                      name="employee"
                      label={t('employee')}
                      options={allowedEmployeesFormatted}
                      hideLabel
                    />
                    <SubmitButton text={t('validate')} color="green" />
                  </Grid>
                </form>
              </RemixFormProvider>
            )}
            {!employee && (
              <Callout.Root color="orange" mt="3">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>{t('heist.prepare.employee.not_chosen_warning')}</Callout.Text>
              </Callout.Root>
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
              addIcon={<PlusCircledIcon aria-label={t('heist_asset.add_quantity')} />}
              removeIcon={<MinusCircledIcon aria-label={t('heist_asset.remove_quantity')} />}
              setGlobalQuantity={(assetId) =>
                getQuantity(assetId) + (cart[assetId] ? cart[assetId].heistAsset?.quantity ?? 0 : 0)
              }
              setQuantity={(assetId) => getQuantity(assetId)}
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
              {asssetsPurchasedFormatted.length > 0 ? (
                <>
                  <Button type="button" onClick={() => clearCart()}>
                    {t('checkout_payment.clear_cart')}
                  </Button>
                  <PaymentDisplay
                    title={t('checkout_payment.caption')}
                    assets={asssetsPurchasedFormatted}
                    rows={{
                      name: t('asset.name'),
                      price: t('asset.price'),
                      quantity: t('asset.quantity'),
                    }}
                  />
                  <Flex gap="4" align="center" justify="end">
                    <Text size="3">
                      {t('checkout_payment.description', {
                        price: new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'USD',
                        }).format(totalPrice),
                      })}
                    </Text>
                    {totalPrice > 0 && user.balance - totalPrice >= 0 && (
                      <FormAlertDialog
                        title={t('checkout_payment.confirmation')}
                        description={t('checkout_payment.confirmation_description')}
                        actionColor="green"
                        cancelText={t('cancel')}
                        formId="heist-prepare-assets-form"
                      >
                        <Button type="button" color="green">
                          {t('purchase')}
                        </Button>
                      </FormAlertDialog>
                    )}
                  </Flex>
                  {!(totalPrice > 0 && user.balance - totalPrice >= 0) && (
                    <Callout.Root color="red" mt="3">
                      <Callout.Icon>
                        <ExclamationTriangleIcon />
                      </Callout.Icon>
                      <Callout.Text>{t('checkout_payment.insufficient_funds')}</Callout.Text>
                    </Callout.Root>
                  )}
                </>
              ) : (
                <Text size="2" className="mb-2">
                  {t('checkout_payment.no_assets')}
                </Text>
              )}
            </Section>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </>
  );
}
