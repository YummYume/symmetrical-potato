import { Button, Grid } from '@radix-ui/themes';
import { useTranslation } from 'react-i18next';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';

import { FieldInput } from '~/lib/components/form/custom/FieldInput';
import { TextAreaInput } from '~/lib/components/form/custom/TextAreaInput';

export default function Form() {
  const { t } = useTranslation();

  const methods = useRemixForm({
    mode: 'onSubmit',
  });

  return (
    <RemixFormProvider {...methods}>
      <form className="grid justify-items-center gap-8">
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
        <Button className="w-full max-w-xs" type="submit">
          {t('submit')}
        </Button>
      </form>
    </RemixFormProvider>
  );
}
