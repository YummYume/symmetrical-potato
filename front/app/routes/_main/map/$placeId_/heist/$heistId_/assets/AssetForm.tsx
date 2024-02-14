import { Flex, Heading, ScrollArea } from '@radix-ui/themes';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { AssetTypeEnum } from '~/lib/api/types';
import { CheckboxInput } from '~/lib/components/form/custom/CheckboxInput';
import { FieldSelect } from '~/lib/components/form/custom/FieldSelect';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { getUriId } from '~/lib/utils/path';
import { formatEnums } from '~/lib/utils/tools';
import { assetResolver } from '~/lib/validators/asset';
import { SubmitButton } from '~components/form/SubmitButton';
import { FieldInput } from '~components/form/custom/FieldInput';

import type { AssetEdge } from '~/lib/api/types';
import type { AssetFormData } from '~/lib/validators/asset';

type AssetFormProps = {
  asset?: AssetEdge['node'];
  placeId: string;
  heistId: string;
};

export default function AssetForm({ asset, placeId, heistId }: AssetFormProps) {
  const { t } = useTranslation();
  const assetTypes = formatEnums(Object.values(AssetTypeEnum), 'asset.type');
  const id = useId();

  const action = `/map/${placeId}/heist/${heistId}/assets/${asset ? `${getUriId(asset.id)}/edit` : 'add'}`;

  const methods = useRemixForm<AssetFormData>({
    mode: 'onSubmit',
    resolver: assetResolver,
    submitConfig: {
      action,
      unstable_viewTransition: true,
    },
    defaultValues: {
      name: asset?.name ?? '',
      description: asset?.description ?? '',
      type: asset?.type ?? AssetTypeEnum.Asset,
      price: asset?.price ?? 0,
      maxQuantity: asset?.maxQuantity ?? 1,
      teamAsset: asset?.teamAsset ?? false,
    },
  });

  const title = asset ? t('update') : t('add');
  const submitText = asset ? t('update') : t('add');
  const submittingText = asset ? t('saving') : t('creating');

  return (
    <Flex gap="4" direction="column" height="100%" className="min-w-96 max-w-[100vw]">
      <Flex justify="between">
        <Flex gap="2" justify="center" align="center">
          <Heading as="h2">{title}</Heading>
        </Flex>
      </Flex>
      <div className="h-[23.875rem]">
        <ScrollArea type="auto" scrollbars="both">
          <RemixFormProvider {...methods}>
            <form
              method="post"
              className="mr-3 space-y-2"
              onSubmit={methods.handleSubmit}
              id={`asset-${id}-form`}
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
          form={`asset-${id}-form`}
          color="green"
          text={submitText}
          submittingText={submittingText}
        />
      </Flex>
    </Flex>
  );
}
