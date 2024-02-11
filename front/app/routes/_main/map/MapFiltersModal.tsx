import { Button, Dialog, Flex, Grid } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider } from 'remix-hook-form';

import { HeistDifficultyEnum, HeistPreferedTacticEnum } from '~/lib/api/types';
import { SubmitButton } from '~/lib/components/form/SubmitButton';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { FieldMultiSelect } from '~/lib/components/form/custom/FieldMultiSelect';
import { formatEnums } from '~/lib/utils/tools';
import dayjs from '~utils/dayjs';

import type { Loader } from './route';
import type { useLoaderData } from '@remix-run/react';
import type { ComponentProps } from 'react';
import type { useRemixForm } from 'remix-hook-form';
import type { Option } from '~/lib/types/select';
import type { MapFiltersFormData } from '~/lib/validators/map-filters';

export type MapFiltersModalProps = {
  methods: ReturnType<typeof useRemixForm<MapFiltersFormData>>;
  establishments: ReturnType<typeof useLoaderData<Loader>>['establishments'];
  children: React.ReactNode;
} & ComponentProps<typeof Dialog.Root>;

export const MapFiltersModal = ({
  methods,
  establishments,
  children,
  ...rest
}: MapFiltersModalProps) => {
  const { t } = useTranslation();
  const heistPreferedTactics = formatEnums(
    Object.values(HeistPreferedTacticEnum),
    'heist.prefered_tactic',
  );
  const heistDifficulties = formatEnums(Object.values(HeistDifficultyEnum), 'heist.difficulty');
  const establishmentsFormatted: Option[] = establishments.edges.map((edge) => ({
    label: edge.node.name,
    value: edge.node.id,
  }));

  return (
    <Dialog.Root {...rest}>
      <Dialog.Trigger>{children}</Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 600 }}>
        <Dialog.Title>{t('map.filters')}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {t('map.filters.description')}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <RemixFormProvider {...methods}>
            <form
              className="contents"
              method="get"
              onSubmit={methods.handleSubmit}
              id="map-filter-form"
            >
              <Grid columns="2" gap="2">
                <FieldInput
                  name="startAtMin"
                  label={t('map.filters.start_at_min')}
                  type="datetime-local"
                  min={dayjs().startOf('day').format('YYYY-MM-DDTHH:mm')}
                />
                <FieldInput
                  name="startAtMax"
                  label={t('map.filters.start_at_max')}
                  type="datetime-local"
                  min={dayjs().startOf('day').format('YYYY-MM-DDTHH:mm')}
                />
              </Grid>
              <Grid columns="2" gap="2">
                <FieldInput
                  name="shouldEndAtMin"
                  label={t('map.filters.end_at_min')}
                  type="datetime-local"
                  min={dayjs().startOf('day').format('YYYY-MM-DDTHH:mm')}
                />
                <FieldInput
                  name="shouldEndAtMax"
                  label={t('map.filters.end_at_max')}
                  type="datetime-local"
                  min={dayjs().startOf('day').format('YYYY-MM-DDTHH:mm')}
                />
              </Grid>
              <Grid columns="2" gap="2">
                <FieldInput
                  name="minimumPayout"
                  label={t('map.filters.minimum_payout')}
                  type="number"
                  step="0.01"
                  min="0"
                />
                <FieldInput
                  name="maximumPayout"
                  label={t('map.filters.maximum_payout')}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </Grid>
              <FieldMultiSelect
                name="preferedTactics"
                label={t('map.filters.prefered_tactics')}
                options={heistPreferedTactics}
              />
              <FieldMultiSelect
                name="difficulties"
                label={t('map.filters.difficulties')}
                options={heistDifficulties}
                menuPlacement="top"
              />
              <FieldMultiSelect
                name="establishments"
                label={t('map.filters.establishments')}
                options={establishmentsFormatted}
                menuPlacement="top"
              />
            </form>
          </RemixFormProvider>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <SubmitButton
            form="map-filter-form"
            variant="soft"
            color="green"
            text={t('apply')}
            allowNavigating
          />
          <Dialog.Close>
            <Button variant="soft" color="blue">
              {t('close')}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
