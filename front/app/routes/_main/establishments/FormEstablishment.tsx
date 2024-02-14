import { Button, Grid } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { FormAlertDialog } from '~/lib/components/dialog/FormAlertDialog';
import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';
import { getUriId } from '~/lib/utils/path';
import { establishmentResolver, type EstablishmentFormData } from '~/lib/validators/establishment';

import type { Establishment } from '~/lib/api/types';

type FormEstablishmentProps = {
  establishment?: Establishment;
};
export function FormEstablishment({ establishment }: FormEstablishmentProps) {
  const { t } = useTranslation();

  const title = establishment ? t('edit') : t('add');
  const description = establishment
    ? t('establishment.edit.confirm')
    : t('establishment.create.confirm');
  const buttonText = establishment ? t('update') : t('create');

  const action = `/establishments/${establishment ? `${getUriId(establishment.id)}/edit` : 'new'}`;

  const methods = useRemixForm<EstablishmentFormData>({
    mode: 'onSubmit',
    resolver: establishmentResolver,
    submitConfig: {
      action,
      unstable_viewTransition: true,
    },
    defaultValues: {
      name: establishment?.name ?? '',
      description: establishment?.description ?? '',
      minimumWage: establishment?.minimumWage ?? 0,
      minimumWorkTimePerWeek: establishment?.minimumWorkTimePerWeek ?? 0,
      contractorCut: establishment?.contractorCut ?? 0,
      employeeCut: establishment?.employeeCut ?? 0,
      crewCut: establishment?.crewCut ?? 0,
    },
  });

  return (
    <RemixFormProvider {...methods}>
      <form
        method="post"
        id="establishment-form"
        className="grid justify-items-center gap-8"
        onSubmit={methods.handleSubmit}
      >
        <div className="grid w-full gap-4 md:flex">
          <Grid className="md:h-full md:!grid-rows-[max-content_auto]" gap="4" grow="1">
            <FieldInput type="text" name="name" label={t('name')} required />
            <TextAreaInput
              containerClassName="!grid-rows-[min-content_auto]"
              name="description"
              label={t('asset.description')}
              rows={5}
            />
          </Grid>
          <Grid gap="4">
            <FieldInput
              type="number"
              name="minimumWage"
              label={t('establishment.minimum_wage')}
              required
            />
            <FieldInput
              type="number"
              name="minimumWorkTimePerWeek"
              label={t('establishment.minimum_work_time_per_week')}
              required
            />
            <FieldInput
              type="number"
              name="contractorCut"
              label={t('establishment.contractor_cut')}
              required
            />
            <FieldInput
              type="number"
              name="employeeCut"
              label={t('establishment.employee_cut')}
              required
            />
            <FieldInput type="number" name="crewCut" label={t('establishment.crew_cut')} required />
          </Grid>
        </div>
        <FormAlertDialog
          title={title}
          description={description}
          actionColor="green"
          cancelText={t('cancel')}
          formId="establishment-form"
        >
          <Button type="button" color="green" className="w-full max-w-xs">
            {buttonText}
          </Button>
        </FormAlertDialog>
      </form>
    </RemixFormProvider>
  );
}
