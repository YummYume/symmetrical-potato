import { Flex, Heading, ScrollArea } from '@radix-ui/themes';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ClientError } from 'graphql-request';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, getValidatedFormData, useRemixForm } from 'remix-hook-form';

import { createAsset } from '~/lib/api/asset';
import { AssetTypeEnum } from '~/lib/api/types';
import { CheckboxInput } from '~/lib/components/form/custom/CheckboxInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { i18next } from '~/lib/i18n/index.server';
import { commitSession, getSession } from '~/lib/session.server';
import { getUriId } from '~/lib/utils/path';
import { formatEnums } from '~/lib/utils/tools';
import { adminAssetResolver } from '~/lib/validators/admin/asset';
import { FLASH_MESSAGE_KEY } from '~/root';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';
import { getMessageForErrorStatusCodes, hasErrorStatusCodes } from '~utils/api';
import { denyAdminAccessUnlessGranted } from '~utils/security.server';

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import type { AdminAssetFormData } from '~/lib/validators/admin/asset';
import type { FlashMessage } from '~/root';

export async function loader({ request, context }: LoaderFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

  const t = await i18next.getFixedT(request, 'admin');

  return {
    meta: {
      title: t('meta.assets_create.title', {
        ns: 'admin',
      }),
      description: t('meta.assets_create.description', {
        ns: 'admin',
      }),
    },
  };
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

export async function action({ request, context }: ActionFunctionArgs) {
  denyAdminAccessUnlessGranted(context.user);

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
    const newAsset = await createAsset(context.client, data, true);

    session.flash(FLASH_MESSAGE_KEY, {
      content: t('asset.created', { ns: 'flash' }),
      type: 'success',
    } as FlashMessage);

    return redirect(`/admin/assets/${getUriId(newAsset.createAsset.asset.id)}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
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

export default function CreateAsset() {
  const { t } = useTranslation();
  const assetTypes = formatEnums(Object.values(AssetTypeEnum), 'asset.type');
  const methods = useRemixForm<AdminAssetFormData>({
    mode: 'onSubmit',
    resolver: adminAssetResolver,
    submitConfig: {
      unstable_viewTransition: true,
    },
    defaultValues: {
      teamAsset: false,
    },
  });

  return (
    <Flex gap="4" direction="column" height="100%">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">{t('asset.create_global', { ns: 'admin' })}</Heading>
        </Flex>
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
            </form>
          </RemixFormProvider>
        </ScrollArea>
      </div>
      <Flex justify="end" align="center" gap="4" className="mt-auto" role="group">
        <SubmitButton
          form="asset-form"
          color="green"
          text={t('create')}
          submittingText={t('creating')}
        />
      </Flex>
    </Flex>
  );
}
