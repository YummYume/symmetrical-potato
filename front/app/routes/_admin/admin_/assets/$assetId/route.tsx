import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button, Flex, Heading, IconButton, ScrollArea, Text } from '@radix-ui/themes';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { getAsset, updateAsset } from '~/lib/api/asset';
import { AssetTypeEnum } from '~/lib/api/types';
import { HistoryInfoPopover } from '~/lib/components/HistoryInfoPopover';
import { Link } from '~/lib/components/Link';
import { AssetTypeBadge } from '~/lib/components/asset/AssetTypeBadge';
import { FormConfirmDialog } from '~/lib/components/dialog/FormConfirmDialog';
import { CheckboxInput } from '~/lib/components/form/custom/CheckboxInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { formatEnums } from '~/lib/utils/tools';
import { adminAssetResolver } from '~/lib/validators/admin/asset';
import { FLASH_MESSAGE_KEY } from '~/root';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes, hasPathError } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { AdminAssetFormData } from '~/lib/validators/admin/asset';
import type { FlashMessage } from '~/root';

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.assetId) {
    throw redirect('/admin/assets');
  }

  try {
    const t = await i18next.getFixedT(request, 'admin');
    const { asset } = await getAsset(context.client, params.assetId);

    return {
      asset,
      meta: {
        title: t('meta.assets_edit.title', {
          ns: 'admin',
        }),
        description: t('meta.assets_edit.description', {
          ns: 'admin',
        }),
      },
    };
  } catch (e) {
    if (!(e instanceof ClientError) || !hasPathError(e, 'asset')) {
      throw e;
    }

    throw new Response(null, {
      status: 404,
      statusText: 'asset.not_found',
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

export async function action({ request, context, params }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  if (!params.assetId) {
    throw redirect('/admin/assets');
  }

  const t = await i18next.getFixedT(request, ['flash', 'validators']);
  const { errors, data, receivedValues } = await getValidatedFormData<AdminAssetFormData>(
    request,
    adminAssetResolver,
  );

  if (errors) {
    return json({ errors, receivedValues }, { status: 400 });
  }

  const session = await getSession(request.headers.get('Cookie'));

  let errorMessage: string | null = null;

  try {
    await updateAsset(
      context.client,
      {
        id: `/assets/${params.assetId}`,
        ...data,
      },
      true,
    );

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('asset.updated', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return json(
      {},
      {
        status: 200,
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (error) {
    if (error instanceof ClientError && hasErrorStatusCodes(error, [422, 401, 404])) {
      errorMessage = getMessageForErrorStatusCodes(error, [422, 401, 404]);
    } else {
      throw error;
    }
  }

  if (errorMessage) {
    session.flash(FLASH_MESSAGE_KEY, {
      content: errorMessage,
      type: 'error',
    } as FlashMessage);
  }

  return json(
    { errors: {}, receivedValues },
    { status: 401, headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export type Action = typeof action;

export default function EditAsset() {
  const { asset } = useLoaderData<Loader>();
  const { t } = useTranslation();
  const assetTypes = formatEnums(Object.values(AssetTypeEnum), 'asset.type');
  const methods = useRemixForm<AdminAssetFormData>({
    mode: 'onSubmit',
    resolver: adminAssetResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      name: asset.name,
      type: asset.type,
      price: asset.price,
      description: asset.description,
      maxQuantity: asset.maxQuantity,
      teamAsset: asset.teamAsset,
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center" wrap="wrap">
          <Heading as="h2">{asset.name}</Heading>
          <AssetTypeBadge type={asset.type} />
        </Flex>
        <HistoryInfoPopover
          createdAt={asset.createdAt}
          createdBy={asset.createdBy?.username}
          updatedAt={asset.updatedAt}
          updatedBy={asset.updatedBy?.username}
        >
          <IconButton aria-label={t('history_info')} size="2" variant="soft" radius="full">
            <InfoCircledIcon width="18" height="18" />
          </IconButton>
        </HistoryInfoPopover>
      </Flex>
      <div className="h-[23.875rem]">
        <ScrollArea type="auto" scrollbars="both">
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="panel__content-form"
              onSubmit={methods.handleSubmit}
              id="asset-form"
            >
              <FieldInput type="text" name="name" label={t('asset.name')} required />
              <FieldSelect name="type" label={t('asset.type')} options={assetTypes} required />
              <FieldInput
                type="number"
                name="price"
                label={t('asset.price')}
                step={0.01}
                required
              />
              <TextAreaInput name="description" label={t('asset.description')} rows={5} />
              <FieldInput
                type="number"
                name="maxQuantity"
                label={t('asset.max_quantity')}
                required
              />
              <CheckboxInput name="teamAsset" label={t('asset.team_asset')} />
              {asset.heist && (
                <Flex direction="column" gap="2">
                  <Text>{t('asset.heist')}</Text>
                  <Link to={`/admin/heists/${asset.heist.id}`}>{asset.heist.name}</Link>
                </Flex>
              )}
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="between" align="center" gap="4" className="mt-auto" role="group">
        <Flex align="center" gap="4">
          <FormConfirmDialog
            formId="asset-delete"
            title={t('delete')}
            description={t('asset.delete.confirm', {
              ns: 'admin',
            })}
            action="delete"
          >
            <Button type="button" color="red">
              {t('delete')}
            </Button>
          </FormConfirmDialog>
        </Flex>
        <SubmitButton
          form="asset-form"
          color="green"
          text={t('save')}
          submittingText={t('saving')}
        />
      </Flex>
    </Flex>
  );
}
